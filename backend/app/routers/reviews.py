import difflib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Workspace, User, Rule, Term, Fact, Asset,
    Content, ContentVersion, Review, Finding, Decision, AuditEvent
)
from ..schemas import (
    ReviewCreateRequest, ReviewDecisionRequest,
    FindingPatchRequest, ReviewResponse, FindingResponse
)
from ..seed_data import DEMO_WORKSPACE_ID, CREATOR_USER_ID, MANAGER_USER_ID
from ..engine.deterministic import DeterministicChecker
from ..engine.ai_adapter import ai_adapter
from ..engine.compliance_scorer import calculate_compliance_score
from ..engine.audit import record_audit_event, verify_audit_chain

router = APIRouter(prefix="/api", tags=["reviews"])

@router.post("/reviews", response_model=ReviewResponse)
def submit_review(data: ReviewCreateRequest, db: Session = Depends(get_db)):
    ws_id = data.workspace_id or DEMO_WORKSPACE_ID
    author_id = data.author_id or CREATOR_USER_ID

    # 1. Load Knowledge Base
    rules = db.query(Rule).filter(Rule.workspace_id == ws_id).all()
    terms = db.query(Term).all()
    facts = db.query(Fact).filter((Fact.workspace_id == ws_id) | (Fact.workspace_id == None)).all()
    assets = db.query(Asset).filter((Asset.workspace_id == ws_id) | (Asset.workspace_id == None)).all()

    # 2. Run Deterministic Checker
    metadata = {}
    if data.image_base64:
        metadata["is_image"] = True
    deterministic_findings = DeterministicChecker.run_all(
        text=data.body_text,
        rules=rules,
        terms=terms,
        assets=assets,
        metadata=metadata
    )

    # 3. Run AI Review Checker (Tone, Claims, Messaging, Intent Guard)
    ai_findings, ai_model, ai_disclosure = ai_adapter.review_content(
        text=data.body_text,
        rules=rules,
        facts=facts,
        assets=assets,
        channel=data.channel,
        purpose=data.purpose
    )

    # 4. Merge Findings (deterministic findings have highest confidence)
    merged_findings = list(deterministic_findings)
    for a_find in ai_findings:
        # Check if an exact overlapping span was already detected deterministically
        overlaps = any(
            abs(d_find.span.start - a_find.span.start) <= 3 and abs(d_find.span.end - a_find.span.end) <= 3
            for d_find in deterministic_findings
        )
        if not overlaps:
            merged_findings.append(a_find)

    # 5. Compute Compliance Score (0 to 100) & Breakdown
    score, breakdown = calculate_compliance_score(merged_findings)

    # 6. Persist Content, Version, Review & Findings in Database
    content = Content(
        workspace_id=ws_id,
        author_id=author_id,
        channel=data.channel,
        purpose=data.purpose,
        current_version=1
    )
    db.add(content)
    db.flush()

    content_version = ContentVersion(
        content_id=content.id,
        version_no=1,
        body_text=data.body_text,
        file_ref=data.filename
    )
    db.add(content_version)
    db.flush()

    review = Review(
        content_version_id=content_version.id,
        status="checked",
        ai_model=ai_model,
        ai_disclosure=ai_disclosure,
        compliance_score=score,
        category_breakdown=breakdown
    )
    db.add(review)
    db.flush()

    persisted_findings = []
    for f in merged_findings:
        db_finding = Finding(
            review_id=review.id,
            type=f.type,
            severity=f.severity,
            confidence=f.confidence,
            span_start=f.span.start,
            span_end=f.span.end,
            issue=f.issue,
            explanation=f.explanation,
            source_type=f.source.type,
            source_id=f.source.id,
            suggestion=f.suggestion,
            status="open"
        )
        db.add(db_finding)
        persisted_findings.append(db_finding)

    # Update author's reviews_count in database
    author_user = db.query(User).filter(User.id == author_id).first()
    if author_user:
        author_user.reviews_count = (author_user.reviews_count or 0) + 1

    db.commit()
    db.refresh(review)

    # 7. Record Audit Event
    record_audit_event(
        db=db,
        actor_id=author_id,
        action="CONTENT_CHECKED",
        target=f"review:{review.id}",
        payload={
            "content_id": content.id,
            "score": score,
            "total_findings": len(persisted_findings),
            "ai_model": ai_model
        }
    )

    return ReviewResponse(
        id=review.id,
        content_version_id=content_version.id,
        content_id=content.id,
        channel=content.channel,
        purpose=content.purpose,
        body_text=content_version.body_text,
        status=review.status,
        ai_model=review.ai_model,
        ai_disclosure=review.ai_disclosure,
        compliance_score=review.compliance_score,
        category_breakdown=review.category_breakdown or {},
        created_at=review.created_at,
        findings=[FindingResponse.model_validate(f) for f in persisted_findings]
    )

@router.get("/reviews/{review_id}")
def get_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    cv = db.query(ContentVersion).filter(ContentVersion.id == review.content_version_id).first()
    content = db.query(Content).filter(Content.id == cv.content_id).first() if cv else None
    findings = db.query(Finding).filter(Finding.review_id == review.id).all()

    # Enrich findings with cited fact or rule details for one-glance verification (Section 5.2 #4)
    facts_lookup = {f.id: f.statement for f in db.query(Fact).all()}
    rules_lookup = {r.id: r.clause_text for r in db.query(Rule).all()}

    enriched_findings = []
    for f in findings:
        f_dict = FindingResponse.model_validate(f).model_dump()
        if f.source_type == "fact":
            f_dict["source_preview"] = facts_lookup.get(f.source_id, "Approved Corporate Fact")
        elif f.source_type == "rule":
            f_dict["source_preview"] = rules_lookup.get(f.source_id, "Brand Guideline Rule")
        enriched_findings.append(f_dict)

    return {
        "id": review.id,
        "content_version_id": review.content_version_id,
        "content_id": content.id if content else "",
        "channel": content.channel if content else "instagram",
        "purpose": content.purpose if content else "",
        "body_text": cv.body_text if cv else "",
        "status": review.status,
        "ai_model": review.ai_model,
        "ai_disclosure": review.ai_disclosure,
        "compliance_score": review.compliance_score,
        "category_breakdown": review.category_breakdown or {},
        "created_at": review.created_at,
        "findings": enriched_findings
    }

@router.patch("/findings/{finding_id}")
def update_finding(finding_id: str, patch: FindingPatchRequest, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.status = patch.status
    if patch.user_edit is not None:
        finding.user_edit = patch.user_edit

    review = db.query(Review).filter(Review.id == finding.review_id).first()
    if review and review.status == "checked":
        review.status = "creator_responded"

    db.commit()

    record_audit_event(
        db=db,
        actor_id=CREATOR_USER_ID,
        action=f"FINDING_{patch.status.upper()}",
        target=f"finding:{finding.id}",
        payload={"new_status": patch.status, "user_edit": patch.user_edit, "comment": patch.comment}
    )

    return {"status": "success", "finding_id": finding.id, "current_status": finding.status}

@router.post("/reviews/{review_id}/submit")
def submit_review_for_approval(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = "in_review"
    db.commit()

    record_audit_event(
        db=db,
        actor_id=CREATOR_USER_ID,
        action="SUBMITTED_FOR_APPROVAL",
        target=f"review:{review.id}",
        payload={"message": "Sent to manager approval queue"}
    )

    return {"status": "success", "review_id": review.id, "review_status": review.status}

@router.post("/reviews/{review_id}/decision")
def record_decision(review_id: str, decision: ReviewDecisionRequest, db: Session = Depends(get_db)):
    # Role Enforcement: Only Manager or Reviewer can approve / request changes!
    if decision.reviewer_role.lower() not in ["manager", "reviewer", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Role security violation: Creators cannot approve reviews. Only a Manager or Reviewer can approve."
        )

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = "approved" if decision.outcome == "approved" else "changes_requested"

    dec = Decision(
        review_id=review.id,
        reviewer_id=decision.reviewer_id or MANAGER_USER_ID,
        outcome=decision.outcome,
        reason=decision.reason
    )
    db.add(dec)
    db.commit()

    record_audit_event(
        db=db,
        actor_id=decision.reviewer_id or MANAGER_USER_ID,
        action=f"DECISION_{decision.outcome.upper()}",
        target=f"review:{review.id}",
        payload={"outcome": decision.outcome, "reason": decision.reason, "role": decision.reviewer_role}
    )

    return {
        "status": "success",
        "review_id": review.id,
        "decision": decision.outcome,
        "new_review_status": review.status
    }

@router.get("/reviews/queue/list")
def get_review_queue(db: Session = Depends(get_db)):
    """
    Queue for managers and reviewers to see pending reviews and open/disputed finding counts.
    """
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    queue_items = []
    for r in reviews:
        cv = db.query(ContentVersion).filter(ContentVersion.id == r.content_version_id).first()
        findings = db.query(Finding).filter(Finding.review_id == r.id).all()
        open_count = sum(1 for f in findings if f.status == "open")
        disputed_count = sum(1 for f in findings if f.status == "disputed")
        accepted_count = sum(1 for f in findings if f.status == "accepted")

        queue_items.append({
            "review_id": r.id,
            "status": r.status,
            "compliance_score": r.compliance_score,
            "body_snippet": cv.body_text[:120] if cv else "",
            "open_findings": open_count,
            "disputed_findings": disputed_count,
            "accepted_findings": accepted_count,
            "total_findings": len(findings),
            "created_at": r.created_at
        })
    return queue_items

@router.get("/reviews/{review_id}/history")
def get_review_history(review_id: str, db: Session = Depends(get_db)):
    """
    Returns original text vs accepted suggested edits diff, and the tamper-evident audit trail for this review.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    cv = db.query(ContentVersion).filter(ContentVersion.id == review.content_version_id).first()
    findings = db.query(Finding).filter(Finding.review_id == review.id).all()

    # Generate revised text by applying accepted or edited suggestions
    original_text = cv.body_text if cv else ""
    sorted_accepted = sorted(
        [f for f in findings if f.status in ["accepted", "edited"] and f.span_end <= len(original_text)],
        key=lambda x: x.span_start,
        reverse=True
    )

    revised_text = original_text
    for f in sorted_accepted:
        replacement = f.user_edit if (f.status == "edited" and f.user_edit) else (f.suggestion or "")
        revised_text = revised_text[:f.span_start] + replacement + revised_text[f.span_end:]

    # Generate line diff
    diff = list(difflib.unified_diff(
        original_text.splitlines(keepends=True),
        revised_text.splitlines(keepends=True),
        fromfile="Original Copy",
        tofile="Revised Compliant Copy"
    ))

    # Audit events targeting this review
    audit_events = db.query(AuditEvent).filter(
        AuditEvent.target.like(f"%{review.id}%")
    ).order_by(AuditEvent.created_at.asc()).all()

    return {
        "review_id": review.id,
        "status": review.status,
        "original_text": original_text,
        "revised_text": revised_text,
        "diff": "".join(diff),
        "audit_events": [
            {
                "id": ev.id,
                "actor_id": ev.actor_id,
                "action": ev.action,
                "payload": ev.payload,
                "prev_hash": ev.prev_hash,
                "hash": ev.hash,
                "created_at": ev.created_at
            }
            for ev in audit_events
        ]
    }

@router.get("/audit/verify")
def verify_audit(db: Session = Depends(get_db)):
    return verify_audit_chain(db)
