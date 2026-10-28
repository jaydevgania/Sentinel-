from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SpanSchema(BaseModel):
    start: int
    end: int

class SourceSchema(BaseModel):
    type: str # rule, fact, asset
    id: str

class FindingCreate(BaseModel):
    type: str # claim, tone, terminology, messaging, visual, accessibility
    severity: str # high, medium, low
    confidence: float = 1.0
    span: SpanSchema
    issue: str
    explanation: str
    source: SourceSchema
    suggestion: Optional[str] = None

class FindingResponse(BaseModel):
    id: str
    review_id: str
    type: str
    severity: str
    confidence: float
    span_start: int
    span_end: int
    issue: str
    explanation: str
    source_type: str
    source_id: str
    suggestion: Optional[str] = None
    status: str
    user_edit: Optional[str] = None

    class Config:
        from_attributes = True

class FindingPatchRequest(BaseModel):
    status: str # accepted, edited, rejected, disputed
    user_edit: Optional[str] = None
    comment: Optional[str] = None

class RuleBase(BaseModel):
    category: str
    clause_text: str
    severity: str = "medium"
    source_doc: Optional[str] = None

class RuleCreate(RuleBase):
    workspace_id: Optional[str] = None

class RuleResponse(RuleBase):
    id: str
    workspace_id: str

    class Config:
        from_attributes = True

class TermBase(BaseModel):
    workspace_id: Optional[str] = None
    preferred: str
    banned_variants: List[str]
    note: Optional[str] = None
    rule_id: Optional[str] = None

class TermCreate(TermBase):
    pass

class TermResponse(TermBase):
    id: str

    class Config:
        from_attributes = True

class FactBase(BaseModel):
    statement: str
    source: Optional[str] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None

class FactCreate(FactBase):
    workspace_id: Optional[str] = None

class FactResponse(FactBase):
    id: str
    workspace_id: Optional[str] = None

    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    type: str
    value: str
    usage_notes: Optional[str] = None

class AssetCreate(AssetBase):
    workspace_id: Optional[str] = None

class AssetResponse(AssetBase):
    id: str
    workspace_id: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewCreateRequest(BaseModel):
    workspace_id: Optional[str] = None
    author_id: Optional[str] = None
    channel: str = "instagram"
    purpose: str = "Promotional announcement"
    body_text: str
    image_base64: Optional[str] = None
    filename: Optional[str] = None

class ReviewDecisionRequest(BaseModel):
    reviewer_id: Optional[str] = None
    reviewer_role: str = "manager" # manager or reviewer
    outcome: str # approved or changes_requested
    reason: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    content_version_id: str
    content_id: str
    channel: str
    purpose: str
    body_text: str
    status: str
    ai_model: Optional[str] = None
    ai_disclosure: Optional[str] = None
    compliance_score: int
    category_breakdown: Dict[str, Any]
    created_at: datetime
    findings: List[FindingResponse] = []

    class Config:
        from_attributes = True

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    brand_name: str

    class Config:
        from_attributes = True
