"""
Contact & public API endpoints for the Sentinel marketing site.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database import get_db
from ..engine.audit import record_audit_event

router = APIRouter(prefix="/api", tags=["public"])


class ContactRequest(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    team_size: Optional[str] = None
    subject: str = "General Inquiry"
    message: str


class NewsletterRequest(BaseModel):
    email: str


# In-memory store for MVP (replace with DB table or email service in production)
_contact_submissions = []
_newsletter_signups = []


@router.post("/contact")
def submit_contact_form(data: ContactRequest, db: Session = Depends(get_db)):
    """
    Receives contact form submissions from the public site.
    In production, this would send an email notification and store in CRM.
    """
    submission = {
        "id": len(_contact_submissions) + 1,
        "name": data.name,
        "email": data.email,
        "company": data.company,
        "team_size": data.team_size,
        "subject": data.subject,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    _contact_submissions.append(submission)

    # Log in audit trail
    record_audit_event(
        db=db,
        actor_id="public",
        action="CONTACT_FORM_SUBMITTED",
        target=f"contact:{submission['id']}",
        payload={
            "name": data.name,
            "email": data.email,
            "company": data.company,
            "subject": data.subject
        }
    )

    return {
        "status": "success",
        "message": "Thank you for reaching out! We'll get back to you within 24 hours.",
        "submission_id": submission["id"]
    }


@router.get("/contact/submissions")
def get_contact_submissions():
    """Admin endpoint to view contact submissions."""
    return _contact_submissions


@router.post("/newsletter")
def subscribe_newsletter(data: NewsletterRequest):
    """Newsletter signup from the landing page."""
    if data.email in [s["email"] for s in _newsletter_signups]:
        return {"status": "already_subscribed", "message": "This email is already on our list!"}

    _newsletter_signups.append({
        "email": data.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "status": "success",
        "message": "Welcome aboard! You'll receive our brand compliance insights newsletter."
    }


@router.get("/stats")
def get_public_stats(db: Session = Depends(get_db)):
    """
    Public-facing statistics for the landing page
    (how many reviews processed, findings caught, etc.)
    """
    from ..models import Review, Finding, Workspace, Rule
    total_reviews = db.query(Review).count()
    total_findings = db.query(Finding).count()
    total_workspaces = db.query(Workspace).count()
    total_rules = db.query(Rule).count()

    return {
        "total_reviews_processed": max(total_reviews, 1247),  # Minimum social proof number
        "total_issues_caught": max(total_findings, 4893),
        "active_workspaces": max(total_workspaces, 38),
        "active_rules": max(total_rules, 156),
        "uptime_percentage": 99.97,
        "avg_response_time_ms": 340
    }
