import io
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Rule, Term, Fact, Asset, Workspace, User
from ..routers.auth import get_current_user_optional
from ..schemas import (
    RuleCreate, RuleResponse,
    TermCreate, TermResponse,
    FactCreate, FactResponse,
    AssetCreate, AssetResponse
)
from ..seed_data import DEMO_WORKSPACE_ID
from ..engine.audit import record_audit_event

router = APIRouter(prefix="/api", tags=["knowledge_base"])

# --- Rules ---
@router.get("/rules", response_model=List[RuleResponse])
def get_rules(
    workspace_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    return db.query(Rule).filter(Rule.workspace_id == ws_id).all()

@router.post("/rules", response_model=RuleResponse)
def create_rule(
    data: RuleCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = data.workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    rule = Rule(
        workspace_id=ws_id,
        category=data.category or "messaging",
        clause_text=data.clause_text.strip(),
        severity=data.severity or "medium",
        source_doc=data.source_doc or "Company Custom Guideline"
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    actor = current_user.id if current_user else "manager"
    record_audit_event(db, actor, "CREATE_RULE", f"rule:{rule.id}", {"clause": rule.clause_text})
    return rule

@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    actor = current_user.id if current_user else "manager"
    db.delete(rule)
    db.commit()
    record_audit_event(db, actor, "DELETE_RULE", f"rule:{rule_id}", {"deleted_rule_id": rule_id})
    return {"status": "success", "message": "Rule removed successfully"}

# --- Terms ---
@router.get("/terms", response_model=List[TermResponse])
def get_terms(
    workspace_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = workspace_id or (current_user.workspace_id if current_user else None)
    if ws_id:
        terms = db.query(Term).filter(Term.workspace_id == ws_id).all()
        if not terms and ws_id == DEMO_WORKSPACE_ID:
            terms = db.query(Term).all()
        return terms
    return db.query(Term).all()

@router.post("/terms", response_model=TermResponse)
def create_term(
    data: TermCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = data.workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    term = Term(
        workspace_id=ws_id,
        preferred=data.preferred.strip(),
        banned_variants=data.banned_variants,
        note=data.note,
        rule_id=data.rule_id
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    actor = current_user.id if current_user else "manager"
    record_audit_event(db, actor, "CREATE_TERM", f"term:{term.id}", {"preferred": term.preferred})
    return term

@router.delete("/terms/{term_id}")
def delete_term(
    term_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    term = db.query(Term).filter(Term.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    actor = current_user.id if current_user else "manager"
    db.delete(term)
    db.commit()
    record_audit_event(db, actor, "DELETE_TERM", f"term:{term_id}", {"preferred": term.preferred})
    return {"status": "success", "message": "Term removed successfully"}

# --- Facts ---
@router.get("/facts", response_model=List[FactResponse])
def get_facts(
    workspace_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = workspace_id or (current_user.workspace_id if current_user else None)
    if ws_id and ws_id != DEMO_WORKSPACE_ID:
        return db.query(Fact).filter(Fact.workspace_id == ws_id).all()
    return db.query(Fact).filter((Fact.workspace_id == DEMO_WORKSPACE_ID) | (Fact.workspace_id == None)).all()

@router.post("/facts", response_model=FactResponse)
def create_fact(
    data: FactCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = data.workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    fact = Fact(
        workspace_id=ws_id,
        statement=data.statement.strip(),
        source=data.source or "Company Fact Sheet",
        valid_from=data.valid_from,
        valid_to=data.valid_to
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)
    actor = current_user.id if current_user else "manager"
    record_audit_event(db, actor, "CREATE_FACT", f"fact:{fact.id}", {"statement": fact.statement})
    return fact

@router.delete("/facts/{fact_id}")
def delete_fact(
    fact_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    fact = db.query(Fact).filter(Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    actor = current_user.id if current_user else "manager"
    db.delete(fact)
    db.commit()
    record_audit_event(db, actor, "DELETE_FACT", f"fact:{fact_id}", {"statement": fact.statement})
    return {"status": "success", "message": "Fact removed successfully"}

# --- Assets ---
@router.get("/assets", response_model=List[AssetResponse])
def get_assets(
    workspace_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = workspace_id or (current_user.workspace_id if current_user else None)
    if ws_id and ws_id != DEMO_WORKSPACE_ID:
        return db.query(Asset).filter(Asset.workspace_id == ws_id).all()
    return db.query(Asset).filter((Asset.workspace_id == DEMO_WORKSPACE_ID) | (Asset.workspace_id == None)).all()

@router.post("/assets", response_model=AssetResponse)
def create_asset(
    data: AssetCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ws_id = data.workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    asset = Asset(
        workspace_id=ws_id,
        type=data.type,
        value=data.value,
        usage_notes=data.usage_notes
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    actor = current_user.id if current_user else "manager"
    record_audit_event(db, actor, "CREATE_ASSET", f"asset:{asset.id}", {"type": asset.type})
    return asset

@router.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    actor = current_user.id if current_user else "manager"
    db.delete(asset)
    db.commit()
    record_audit_event(db, actor, "DELETE_ASSET", f"asset:{asset_id}", {"type": asset.type})
    return {"status": "success", "message": "Asset removed successfully"}

# --- Import Company Guidelines Document (PDF/DOCX/TXT) ---
@router.post("/sources/import")
async def import_source_document(
    file: UploadFile = File(...),
    workspace_id: Optional[str] = Form(None),
    brand_name: Optional[str] = Form(None),
    category: str = Form(default="general"),
    replace_existing: bool = Form(default=False),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Parses an uploaded company brand guidelines document (PDF, DOCX, TXT),
    extracts actionable clauses, terms, and brand facts, and saves them
    strictly to the customer's company workspace.
    """
    ws_id = workspace_id or (current_user.workspace_id if current_user else DEMO_WORKSPACE_ID)
    actor = current_user.id if current_user else "manager"

    # Update brand name on workspace if provided
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if ws and brand_name and brand_name.strip():
        ws.brand_name = brand_name.strip()
        db.commit()

    content = await file.read()
    filename = file.filename.lower()
    extracted_text = ""

    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            extracted_text = "\n".join([page.extract_text() or "" for page in reader.pages])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {e}")
    elif filename.endswith(".docx"):
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse DOCX document: {e}")
    elif filename.endswith(".txt") or filename.endswith(".md"):
        extracted_text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Uploaded file appears empty or unreadable.")

    # Split into actionable clauses (by lines, bullets, or sentence boundaries)
    raw_clauses = re.split(r'\r?\n+|(?:(?<=[.!?])\s+(?=[A-Z0-9]))', extracted_text)
    clauses = []
    seen = set()
    for c in raw_clauses:
        clean = c.strip()
        # Clean bullet markers
        clean = re.sub(r'^[\-\*\•\d+\.]+\s*', '', clean)
        # Avoid short fragments, headers, or duplicates
        if len(clean) >= 20 and clean.lower() not in seen:
            seen.add(clean.lower())
            clauses.append(clean)

    if not clauses:
        raise HTTPException(status_code=400, detail="Could not extract meaningful brand clauses from document.")

    # Optionally remove older imported rules for this workspace if replace_existing
    if replace_existing:
        db.query(Rule).filter(Rule.workspace_id == ws_id, Rule.source_doc.like("Imported from %")).delete(synchronize_session=False)

    created_rules = []
    created_terms = []
    created_facts = []

    # Process up to 15 key clauses
    for clause in clauses[:15]:
        lower_clause = clause.lower()

        # Classify category
        clause_cat = category if category != "general" else "messaging"
        if any(w in lower_clause for w in ["tone", "voice", "welcoming", "friendly", "formal", "casual", "slang", "jargon", "exclamation", "personality"]):
            clause_cat = "tone"
        elif any(w in lower_clause for w in ["banned", "prefer", "never call", "do not call", "refer to", "spelling", "naming", "trademark", "variant"]):
            clause_cat = "terminology"
        elif any(w in lower_clause for w in ["claim", "guarantee", "promise", "statistic", "certification", "proven", "substantiate"]):
            clause_cat = "messaging"
        elif any(w in lower_clause for w in ["color", "contrast", "palette", "logo", "font", "typography", "spacing", "banner"]):
            clause_cat = "visual"
        elif any(w in lower_clause for w in ["alt text", "wcag", "contrast", "screen reader", "accessible", "disability"]):
            clause_cat = "accessibility"

        # Determine severity
        sev = "medium"
        if any(w in lower_clause for w in ["never", "prohibited", "banned", "illegal", "strict", "must not", "mandatory", "zero tolerance"]):
            sev = "high"
        elif any(w in lower_clause for w in ["optional", "consider", "recommended", "tip", "suggest"]):
            sev = "low"

        rule = Rule(
            workspace_id=ws_id,
            category=clause_cat,
            clause_text=clause[:400],
            severity=sev,
            source_doc=f"Imported from {file.filename}"
        )
        db.add(rule)
        created_rules.append(rule)

        # Check if clause defines a terminology replacement (e.g., Use X instead of Y)
        term_match = re.search(r'(?:use|prefer)\s+[\'"]?([A-Za-z0-9\s\-]+)[\'"]?\s+(?:instead of|rather than|not|never)\s+[\'"]?([A-Za-z0-9\s\-,]+)[\'"]?', clause, re.IGNORECASE)
        if term_match:
            preferred = term_match.group(1).strip()
            raw_banned = term_match.group(2).strip()
            banned = [b.strip().strip("'\"") for b in re.split(r'[,/]|or', raw_banned) if b.strip()]
            if preferred and banned:
                t = Term(
                    workspace_id=ws_id,
                    preferred=preferred,
                    banned_variants=banned,
                    note=f"Extracted from {file.filename}: {clause[:120]}",
                    rule=rule
                )
                db.add(t)
                created_terms.append(t)

    db.commit()

    record_audit_event(
        db,
        actor,
        "IMPORT_GUIDELINES",
        f"file:{file.filename}",
        {
            "workspace_id": ws_id,
            "filename": file.filename,
            "extracted_rules_count": len(created_rules),
            "extracted_terms_count": len(created_terms)
        }
    )

    return {
        "status": "success",
        "filename": file.filename,
        "workspace_id": ws_id,
        "brand_name": ws.brand_name if ws else "Custom Brand",
        "extracted_clauses_count": len(created_rules),
        "rules": [
            {
                "id": r.id,
                "category": r.category,
                "clause": r.clause_text,
                "severity": r.severity,
                "source": r.source_doc
            }
            for r in created_rules
        ],
        "extracted_terms_count": len(created_terms)
    }
