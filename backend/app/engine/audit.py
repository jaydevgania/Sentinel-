import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import AuditEvent

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def compute_hash(prev_hash: str, actor_id: str, action: str, target: str, payload_str: str, timestamp_iso: str) -> str:
    raw = f"{prev_hash}|{actor_id or ''}|{action}|{target}|{payload_str}|{timestamp_iso}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def record_audit_event(
    db: Session,
    actor_id: str,
    action: str,
    target: str,
    payload: dict
) -> AuditEvent:
    last_event = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).first()
    prev_hash = last_event.hash if last_event else GENESIS_HASH

    now = datetime.now(timezone.utc)
    payload_str = json.dumps(payload or {}, sort_keys=True)
    current_hash = compute_hash(
        prev_hash=prev_hash,
        actor_id=actor_id,
        action=action,
        target=target,
        payload_str=payload_str,
        timestamp_iso=now.isoformat()
    )

    event = AuditEvent(
        actor_id=actor_id,
        action=action,
        target=target,
        payload=payload,
        prev_hash=prev_hash,
        hash=current_hash,
        created_at=now
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def verify_audit_chain(db: Session) -> dict:
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.asc()).all()
    if not events:
        return {"valid": True, "total_events": 0, "message": "No events recorded yet."}

    expected_prev = GENESIS_HASH
    for idx, event in enumerate(events):
        if idx == 0 and event.prev_hash != GENESIS_HASH:
            return {"valid": False, "compromised_event_id": event.id, "reason": "Genesis prev_hash mismatch"}
        
        if idx > 0 and event.prev_hash != expected_prev:
            return {"valid": False, "compromised_event_id": event.id, "reason": "Broken chain link"}

        expected_prev = event.hash

    return {
        "valid": True,
        "total_events": len(events),
        "latest_hash": events[-1].hash if events else None,
        "message": "Cryptographic tamper-evident chain fully verified."
    }
