import io
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Rule, Term, Fact, Asset
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
def get_rules(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    ws_id = workspace_id or DEMO_WORKSPACE_ID
    return db.query(Rule).filter(Rule.workspace_id == ws_id).all()

@router.post("/rules", response_model=RuleResponse)
def create_rule(data: RuleCreate, db: Session = Depends(get_db)):
    ws_id = data.workspace_id or DEMO_WORKSPACE_ID
    rule = Rule(
        workspace_id=ws_id,
        category=data.category,
        clause_text=data.clause_text,
        severity=data.severity,
        source_doc=data.source_doc
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    record_audit_event(db, "manager", "CREATE_RULE", f"rule:{rule.id}", {"clause": rule.clause_text})
    return rule

# --- Terms ---
@router.get("/terms", response_model=List[TermResponse])
def get_terms(db: Session = Depends(get_db)):
    return db.query(Term).all()

@router.post("/terms", response_model=TermResponse)
def create_term(data: TermCreate, db: Session = Depends(get_db)):
    term = Term(
        preferred=data.preferred,
        banned_variants=data.banned_variants,
        note=data.note,
        rule_id=data.rule_id
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    record_audit_event(db, "manager", "CREATE_TERM", f"term:{term.id}", {"preferred": term.preferred})
    return term

# --- Facts ---
@router.get("/facts", response_model=List[FactResponse])
def get_facts(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    ws_id = workspace_id or DEMO_WORKSPACE_ID
    return db.query(Fact).filter((Fact.workspace_id == ws_id) | (Fact.workspace_id == None)).all()

@router.post("/facts", response_model=FactResponse)
def create_fact(data: FactCreate, db: Session = Depends(get_db)):
    ws_id = data.workspace_id or DEMO_WORKSPACE_ID
    fact = Fact(
        workspace_id=ws_id,
        statement=data.statement,
        source=data.source,
        valid_from=data.valid_from,
        valid_to=data.valid_to
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)
    record_audit_event(db, "manager", "CREATE_FACT", f"fact:{fact.id}", {"statement": fact.statement})
    return fact

# --- Assets ---
@router.get("/assets", response_model=List[AssetResponse])
def get_assets(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    ws_id = workspace_id or DEMO_WORKSPACE_ID
    return db.query(Asset).filter((Asset.workspace_id == ws_id) | (Asset.workspace_id == None)).all()

@router.post("/assets", response_model=AssetResponse)
def create_asset(data: AssetCreate, db: Session = Depends(get_db)):
    ws_id = data.workspace_id or DEMO_WORKSPACE_ID
    asset = Asset(
        workspace_id=ws_id,
        type=data.type,
        value=data.value,
        usage_notes=data.usage_notes
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    record_audit_event(db, "manager", "CREATE_ASSET", f"asset:{asset.id}", {"type": asset.type})
    return asset

# --- Import Document & Extract Clauses ---
@router.post("/sources/import")
async def import_source_document(
    file: UploadFile = File(...),
    workspace_id: str = Form(default=DEMO_WORKSPACE_ID),
    category: str = Form(default="general"),
    db: Session = Depends(get_db)
):
    """
    Parses an uploaded brand guidelines PDF or DOCX file, extracts clauses,
    and creates new active rules in the knowledge base.
    """
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

    # Split into actionable clauses (sentences or bullet points)
    clauses = re.split(r'\n+|(?:(?<=[.!?])\s+(?=[A-Z]))', extracted_text)
    clauses = [c.strip() for c in clauses if len(c.strip()) > 25]

    created_rules = []
    # Take first 5 high-value clauses to avoid cluttering
    for clause in clauses[:5]:
        r = Rule(
            workspace_id=workspace_id,
            category=category if category != "general" else "messaging",
            clause_text=clause[:300],
            severity="medium",
            source_doc=f"Imported from {file.filename}"
        )
        db.add(r)
        created_rules.append(r)

    db.commit()
    record_audit_event(
        db,
        "manager",
        "IMPORT_GUIDELINES",
        f"file:{file.filename}",
        {"extracted_rules_count": len(created_rules)}
    )

    return {
        "status": "success",
        "filename": file.filename,
        "extracted_clauses_count": len(created_rules),
        "rules": [{"id": r.id, "clause": r.clause_text} for r in created_rules]
    }
