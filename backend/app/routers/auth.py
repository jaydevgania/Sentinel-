import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import jwt
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Workspace, Rule, Term, Fact, SubscriptionTransaction, Lead, Subscriber, AccessWhitelist
from ..engine.audit import record_audit_event

router = APIRouter(prefix="/api", tags=["auth_and_subscriptions"])

JWT_SECRET = os.getenv("JWT_SECRET", "sentinel-super-secret-key-2026-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30

# Password hashing with PBKDF2 HMAC SHA-256
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"{salt}:{pwd_hash}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    if not stored_hash or ":" not in stored_hash:
        return False
    salt, original_hash = stored_hash.split(":", 1)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return secrets.compare_digest(pwd_hash, original_hash)

def create_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# Sole Developer Email with Exclusive Master Access
SOLE_DEVELOPER_EMAIL = "devgania1@gmail.com"
DEVELOPER_EMAILS = [SOLE_DEVELOPER_EMAIL]

def is_developer_email(email: str) -> bool:
    if not email:
        return False
    return email.lower().strip() == SOLE_DEVELOPER_EMAIL

def check_access_permission(email: str, db: Session) -> bool:
    """
    Returns True if:
    1. Email is the developer's email
    2. Email is on the developer's Access Whitelist
    3. User exists and is_approved == 1
    """
    clean_email = email.lower().strip()
    if is_developer_email(clean_email):
        return True

    whitelisted = db.query(AccessWhitelist).filter(AccessWhitelist.email == clean_email).first()
    if whitelisted:
        return True

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user and existing_user.is_approved:
        return True

    return False

# Schemas
class GrantAccessRequest(BaseModel):
    email: EmailStr
    notes: Optional[str] = "Granted by developer"

class RevokeAccessRequest(BaseModel):
    email: EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: Optional[str] = None
    brand_name: Optional[str] = None
    plan: Optional[str] = "starter"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None # Google ID token
    access_token: Optional[str] = None # Google OAuth2 access token
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None

class SubscriptionCheckoutRequest(BaseModel):
    tier: str # starter, pro, enterprise
    billing_period: str = "monthly" # monthly, annual
    payment_method: Optional[str] = "simulated_credit_card"

# 1. Register Endpoint
@router.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    company = data.company_name or f"{data.name}'s Company"
    brand = data.brand_name or company

    # Create customer's isolated workspace
    workspace = Workspace(
        name=f"{company} Workspace",
        brand_name=brand
    )
    db.add(workspace)
    db.flush()

    # Pre-seed default starter rules for their brand
    default_rules = [
        Rule(
            workspace_id=workspace.id,
            category="tone",
            clause_text=f"Tone for {brand} should be welcoming, professional, and accessible. Avoid excessive jargon and limit exclamation marks.",
            severity="medium",
            source_doc="Brand Setup"
        ),
        Rule(
            workspace_id=workspace.id,
            category="terminology",
            clause_text=f"Always write '{brand}' correctly in all communications.",
            severity="high",
            source_doc="Brand Setup"
        ),
        Rule(
            workspace_id=workspace.id,
            category="messaging",
            clause_text="Never make unsubstantiated absolute claims or mention direct competitors disparagingly.",
            severity="high",
            source_doc="Legal Standard"
        )
    ]
    db.add_all(default_rules)

    # First user or admin email check
    is_dev = is_developer_email(email_clean)
    whitelisted = db.query(AccessWhitelist).filter(AccessWhitelist.email == email_clean).first()
    has_access = is_dev or (whitelisted is not None)

    is_admin = 1 if is_dev else 0
    is_approved = 1 if has_access else 0

    user = User(
        workspace_id=workspace.id,
        name=data.name,
        email=email_clean,
        hashed_password=hash_password(data.password),
        company_name=company,
        role="manager", # Workspace owner is manager
        is_admin=is_admin,
        is_approved=is_approved,
        subscription_tier=data.plan.lower() if data.plan else "starter",
        subscription_status="active",
        subscription_period="monthly",
        reviews_count=0
    )
    db.add(user)

    if not has_access:
        # Submit access request lead for developer approval
        db.add(Lead(
            name=data.name,
            email=email_clean,
            company=company,
            subject="Customer Access Request (Registration)",
            message="Customer registration access request pending developer authorization.",
            status="pending_approval"
        ))
        db.commit()
        raise HTTPException(
            status_code=403,
            detail="Access Restricted: Customer access can only be accessed by the developer or accounts approved by the developer. Your request has been queued for developer approval."
        )

    db.commit()
    db.refresh(user)

    token = create_token(user.id, user.email, user.role)

    # Record in cryptographic audit chain
    record_audit_event(
        db=db,
        actor_id=user.id,
        action="CUSTOMER_REGISTERED",
        target=f"user:{user.id}",
        payload={"email": user.email, "company": company, "plan": user.subscription_tier}
    )

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company_name": user.company_name,
            "role": user.role,
            "is_admin": bool(user.is_admin),
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "workspace_id": user.workspace_id,
            "brand_name": brand
        }
    }

# 2. Login Endpoint
@router.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(data.password, user.hashed_password or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Access control: developer or granted by developer
    is_dev = is_developer_email(email_clean)
    if not is_dev and not user.is_approved:
        # Check if in whitelist
        whitelisted = db.query(AccessWhitelist).filter(AccessWhitelist.email == email_clean).first()
        if whitelisted:
            user.is_approved = 1
            db.commit()
        else:
            raise HTTPException(
                status_code=403,
                detail="Access Restricted: Customer access can only be accessed by the developer or accounts approved by the developer. Please contact the developer to unlock access."
            )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_token(user.id, user.email, user.role)
    ws = db.query(Workspace).filter(Workspace.id == user.workspace_id).first()

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company_name": user.company_name,
            "role": user.role,
            "is_admin": bool(user.is_admin),
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "workspace_id": user.workspace_id,
            "brand_name": ws.brand_name if ws else user.name
        }
    }

# 3. Google Sign-In & Registration Endpoint
@router.post("/auth/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    email = None
    name = None
    picture = None
    google_sub = None

    if data.credential:
        try:
            if GOOGLE_CLIENT_ID:
                id_info = google_id_token.verify_oauth2_token(
                    data.credential,
                    google_requests.Request(),
                    GOOGLE_CLIENT_ID
                )
            else:
                id_info = jwt.decode(data.credential, options={"verify_signature": False})

            email = id_info.get("email")
            name = id_info.get("name")
            picture = id_info.get("picture")
            google_sub = id_info.get("sub")
        except Exception as e:
            if data.email:
                email = data.email
                name = data.name
            else:
                raise HTTPException(status_code=400, detail=f"Google token verification failed: {e}")
    elif data.access_token:
        # Real Google OAuth2 Access Token verified directly with Google API
        try:
            import requests
            resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {data.access_token}"},
                timeout=10
            )
            if not resp.ok:
                raise HTTPException(status_code=400, detail=f"Google OAuth verification failed: {resp.text}")
            user_info = resp.json()
            email = user_info.get("email")
            name = user_info.get("name")
            picture = user_info.get("picture")
            google_sub = user_info.get("sub")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to verify Google access token: {e}")
    elif data.email:
        email = data.email
        name = data.name or data.email.split("@")[0].capitalize()
        picture = data.picture
        google_sub = data.google_id
    else:
        raise HTTPException(status_code=400, detail="Missing Google credentials.")

    if not email:
        raise HTTPException(status_code=400, detail="Could not extract email from Google credential.")

    email_clean = email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    is_dev = is_developer_email(email_clean)
    whitelisted = db.query(AccessWhitelist).filter(AccessWhitelist.email == email_clean).first()
    has_access = is_dev or (whitelisted is not None)

    if user:
        if not user.is_approved and not has_access:
            raise HTTPException(
                status_code=403,
                detail=f"Access Restricted: Customer access can only be accessed by the developer or accounts approved by the developer. Google account ({email_clean}) is not authorized yet."
            )
        if not user.is_approved and has_access:
            user.is_approved = 1
            db.commit()

        user.last_login_at = datetime.now(timezone.utc)
        if name and not user.name:
            user.name = name
        db.commit()

        token = create_token(user.id, user.email, user.role)
        ws = db.query(Workspace).filter(Workspace.id == user.workspace_id).first()

        record_audit_event(
            db=db,
            actor_id=user.id,
            action="GOOGLE_LOGIN",
            target=f"user:{user.id}",
            payload={"email": user.email}
        )

        return {
            "status": "success",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "company_name": user.company_name or f"{user.name}'s Company",
                "role": user.role,
                "is_admin": bool(user.is_admin),
                "subscription_tier": user.subscription_tier or "starter",
                "subscription_status": user.subscription_status or "active",
                "workspace_id": user.workspace_id,
                "brand_name": ws.brand_name if ws else user.name,
                "picture": picture
            }
        }
    else:
        # Register new Google customer with dedicated brand workspace
        company = f"{name}'s Company" if name else "My Brand Company"
        brand = f"{name}'s Brand" if name else "My Brand"

        workspace = Workspace(
            name=f"{company} Workspace",
            brand_name=brand
        )
        db.add(workspace)
        db.flush()

        # Seed starter rules
        default_rules = [
            Rule(
                workspace_id=workspace.id,
                category="tone",
                clause_text=f"Tone for {brand} should be welcoming, professional, and accessible. Avoid excessive jargon and limit exclamation marks.",
                severity="medium",
                source_doc="Brand Setup"
            ),
            Rule(
                workspace_id=workspace.id,
                category="terminology",
                clause_text=f"Always write '{brand}' correctly in all communications.",
                severity="high",
                source_doc="Brand Setup"
            )
        ]
        db.add_all(default_rules)

        is_admin = 1 if is_dev else 0
        is_approved = 1 if has_access else 0

        user = User(
            workspace_id=workspace.id,
            name=name or email_clean.split("@")[0].capitalize(),
            email=email_clean,
            hashed_password=hash_password(secrets.token_urlsafe(16)),
            company_name=company,
            role="manager",
            is_admin=is_admin,
            is_approved=is_approved,
            subscription_tier="starter",
            subscription_status="active",
            subscription_period="monthly",
            reviews_count=0
        )
        db.add(user)

        if not has_access:
            # Submit access request lead for developer approval
            db.add(Lead(
                name=user.name,
                email=email_clean,
                company=company,
                subject="Google Sign-In Access Request",
                message="Google Sign-In access request pending developer authorization.",
                status="pending_approval"
            ))
            db.commit()
            raise HTTPException(
                status_code=403,
                detail=f"Access Restricted: Customer access can only be accessed by the developer or accounts approved by the developer. Your Google account ({email_clean}) has been submitted for authorization."
            )

        db.commit()
        db.refresh(user)

        token = create_token(user.id, user.email, user.role)

        record_audit_event(
            db=db,
            actor_id=user.id,
            action="GOOGLE_REGISTER",
            target=f"user:{user.id}",
            payload={"email": user.email, "company": company}
        )

        return {
            "status": "success",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "company_name": user.company_name,
                "role": user.role,
                "is_admin": bool(user.is_admin),
                "subscription_tier": user.subscription_tier,
                "subscription_status": user.subscription_status,
                "workspace_id": user.workspace_id,
                "brand_name": brand,
                "picture": picture
            }
        }

# 4. Get Current User Profile
@router.get("/auth/me")
def get_me(current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    ws = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "company_name": current_user.company_name,
        "role": current_user.role,
        "is_admin": bool(current_user.is_admin),
        "subscription_tier": current_user.subscription_tier,
        "subscription_status": current_user.subscription_status,
        "subscription_period": current_user.subscription_period,
        "reviews_count": current_user.reviews_count,
        "workspace_id": current_user.workspace_id,
        "brand_name": ws.brand_name if ws else current_user.name
    }

# 4. Subscription Checkout & Upgrade
@router.post("/subscriptions/checkout")
def checkout_subscription(
    data: SubscriptionCheckoutRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Please login or create an account to upgrade your subscription.")

    tier = data.tier.lower()
    amount = 0.0
    if tier == "pro":
        amount = 39.0 * 12 if data.billing_period == "annual" else 49.0
    elif tier == "enterprise":
        amount = 299.0

    current_user.subscription_tier = tier
    current_user.subscription_status = "active"
    current_user.subscription_period = data.billing_period

    tx = SubscriptionTransaction(
        user_id=current_user.id,
        tier=tier,
        amount=amount,
        billing_cycle=data.billing_period,
        status="paid",
        payment_method=data.payment_method or "simulated_card"
    )
    db.add(tx)
    db.commit()

    record_audit_event(
        db=db,
        actor_id=current_user.id,
        action="SUBSCRIPTION_UPGRADED",
        target=f"user:{current_user.id}",
        payload={"tier": tier, "amount": amount, "billing": data.billing_period}
    )

    return {
        "status": "success",
        "message": f"Successfully upgraded to Sentinel {tier.capitalize()} plan!",
        "subscription": {
            "tier": current_user.subscription_tier,
            "status": current_user.subscription_status,
            "period": current_user.subscription_period,
            "amount_billed": amount
        }
    }

# 5. Customer Database for the Owner/Admin ("those who logins in it i get their database")
@router.get("/admin/customers")
def get_customer_database(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns full database of all customers who registered, logged in,
    their subscription tiers, review counts, and company details.
    """
    query = db.query(User).order_by(User.created_at.desc())
    if tier:
        query = query.filter(User.subscription_tier == tier.lower())

    users = query.all()
    results = []
    for u in users:
        ws = db.query(Workspace).filter(Workspace.id == u.workspace_id).first()
        is_appr = bool(u.is_approved or is_developer_email(u.email or ""))
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "company_name": u.company_name or "N/A",
            "brand_name": ws.brand_name if ws else "N/A",
            "role": u.role,
            "is_admin": bool(u.is_admin),
            "is_approved": is_appr,
            "subscription_tier": u.subscription_tier or "starter",
            "subscription_status": u.subscription_status or "active",
            "subscription_period": u.subscription_period or "monthly",
            "reviews_count": u.reviews_count or 0,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None
        })

    return {
        "total_customers": len(results),
        "customers": results
    }

# 6. Leads Database for the Owner/Admin (Contact Form submissions)
@router.get("/admin/leads")
def get_leads_database(db: Session = Depends(get_db)):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return {
        "total_leads": len(leads),
        "leads": [
            {
                "id": l.id,
                "name": l.name,
                "email": l.email,
                "company": l.company,
                "team_size": l.team_size,
                "subject": l.subject,
                "message": l.message,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None
            }
            for l in leads
        ]
    }

# 7. Update Lead Status & Auto-grant access on approval
@router.patch("/admin/leads/{lead_id}")
def update_lead_status(lead_id: str, status: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = status

    # If lead is approved by developer, automatically whitelist and approve customer
    if status.lower() == "approved":
        clean_email = lead.email.lower().strip()
        existing_wl = db.query(AccessWhitelist).filter(AccessWhitelist.email == clean_email).first()
        if not existing_wl:
            db.add(AccessWhitelist(
                email=clean_email,
                granted_by="developer",
                notes=f"Approved from Lead #{lead.id}"
            ))
        user = db.query(User).filter(User.email == clean_email).first()
        if user:
            user.is_approved = 1

    db.commit()
    return {"status": "success", "lead_id": lead.id, "new_status": lead.status}

# 8. Whitelist & Developer Access Control Endpoints
@router.get("/admin/whitelist")
def get_whitelist(db: Session = Depends(get_db)):
    whitelist = db.query(AccessWhitelist).order_by(AccessWhitelist.created_at.desc()).all()
    return {
        "developer_emails": DEVELOPER_EMAILS,
        "whitelisted": [
            {
                "id": w.id,
                "email": w.email,
                "granted_by": w.granted_by,
                "notes": w.notes,
                "created_at": w.created_at.isoformat() if w.created_at else None
            }
            for w in whitelist
        ]
    }

@router.post("/admin/grant-access")
def grant_access(data: GrantAccessRequest, db: Session = Depends(get_db)):
    clean_email = data.email.lower().strip()

    # 1. Add to whitelist if not exists
    wl = db.query(AccessWhitelist).filter(AccessWhitelist.email == clean_email).first()
    if not wl:
        wl = AccessWhitelist(
            email=clean_email,
            granted_by="developer",
            notes=data.notes or "Granted by developer"
        )
        db.add(wl)

    # 2. Update user if exists
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        user.is_approved = 1

    # 3. Update any pending leads for this email
    leads = db.query(Lead).filter(Lead.email == clean_email).all()
    for l in leads:
        l.status = "approved"

    db.commit()
    return {
        "status": "success",
        "message": f"Customer access granted to {clean_email}",
        "email": clean_email
    }

@router.post("/admin/revoke-access")
def revoke_access(data: RevokeAccessRequest, db: Session = Depends(get_db)):
    clean_email = data.email.lower().strip()
    if is_developer_email(clean_email):
        raise HTTPException(status_code=400, detail="Cannot revoke access from developer email.")

    # Remove from whitelist
    db.query(AccessWhitelist).filter(AccessWhitelist.email == clean_email).delete()

    # Update user is_approved = 0
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        user.is_approved = 0

    db.commit()
    return {
        "status": "success",
        "message": f"Customer access revoked for {clean_email}",
        "email": clean_email
    }
