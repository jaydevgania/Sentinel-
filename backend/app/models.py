import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from .database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), default=gen_uuid, primary_key=True)
    name = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=False)

    users = relationship("User", back_populates="workspace", cascade="all, delete-orphan")
    rules = relationship("Rule", back_populates="workspace", cascade="all, delete-orphan")
    contents = relationship("Content", back_populates="workspace", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="creator") # creator, manager, reviewer, admin
    is_admin = Column(Integer, default=0) # 1 if admin
    is_approved = Column(Integer, default=0) # 1 if approved by developer, 0 if pending
    subscription_tier = Column(String(50), default="starter") # starter, pro, enterprise
    subscription_status = Column(String(50), default="active") # active, trialing, canceled
    subscription_period = Column(String(50), default="monthly") # monthly, annual
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime, nullable=True)

    workspace = relationship("Workspace", back_populates="users")
    transactions = relationship("SubscriptionTransaction", back_populates="user", cascade="all, delete-orphan")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    team_size = Column(String(50), nullable=True)
    subject = Column(String(255), default="General Inquiry")
    message = Column(Text, nullable=False)
    status = Column(String(50), default="new") # new, contacted, qualified, converted
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    source = Column(String(100), default="landing_page")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AccessWhitelist(Base):
    __tablename__ = "access_whitelist"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    granted_by = Column(String(255), nullable=True) # Developer email who granted access
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SubscriptionTransaction(Base):
    __tablename__ = "subscription_transactions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    tier = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    billing_cycle = Column(String(50), default="monthly")
    status = Column(String(50), default="paid")
    payment_method = Column(String(50), default="simulated_card")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")

class Rule(Base):
    __tablename__ = "rules"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    category = Column(String(50), nullable=False) # tone, terminology, messaging, visual, accessibility
    clause_text = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="medium") # high, medium, low
    source_doc = Column(String(255), nullable=True)
    embedding = Column(JSON, nullable=True) # vector float list

    workspace = relationship("Workspace", back_populates="rules")
    terms = relationship("Term", back_populates="rule", cascade="all, delete-orphan")

class Term(Base):
    __tablename__ = "terms"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    preferred = Column(String(255), nullable=False)
    banned_variants = Column(JSON, nullable=False, default=list) # List[str]
    note = Column(Text, nullable=True)
    rule_id = Column(String(36), ForeignKey("rules.id"), nullable=True)

    rule = relationship("Rule", back_populates="terms")

class Fact(Base):
    __tablename__ = "facts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True)
    statement = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)
    valid_from = Column(String(50), nullable=True)
    valid_to = Column(String(50), nullable=True)
    embedding = Column(JSON, nullable=True)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True)
    type = Column(String(50), nullable=False) # logo, palette, font
    value = Column(Text, nullable=False) # hex code, file path, font name
    usage_notes = Column(Text, nullable=True)

class Content(Base):
    __tablename__ = "contents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    channel = Column(String(100), default="instagram") # instagram, press_release, website, internal
    purpose = Column(String(255), default="Promotional announcement")
    current_version = Column(Integer, default=1)

    workspace = relationship("Workspace", back_populates="contents")
    versions = relationship("ContentVersion", back_populates="content", cascade="all, delete-orphan")

class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    content_id = Column(String(36), ForeignKey("contents.id"), nullable=False)
    version_no = Column(Integer, nullable=False, default=1)
    body_text = Column(Text, nullable=False)
    file_ref = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    content = relationship("Content", back_populates="versions")
    reviews = relationship("Review", back_populates="content_version", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    content_version_id = Column(String(36), ForeignKey("content_versions.id"), nullable=False)
    status = Column(String(50), nullable=False, default="checked") # draft, checked, creator_responded, in_review, approved, changes_requested
    ai_model = Column(String(100), nullable=True)
    ai_disclosure = Column(Text, nullable=True)
    compliance_score = Column(Integer, default=100)
    category_breakdown = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    content_version = relationship("ContentVersion", back_populates="reviews")
    findings = relationship("Finding", back_populates="review", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="review", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    review_id = Column(String(36), ForeignKey("reviews.id"), nullable=False)
    type = Column(String(50), nullable=False) # claim, tone, terminology, messaging, visual, accessibility
    severity = Column(String(20), nullable=False, default="medium") # high, medium, low
    confidence = Column(Float, default=1.0)
    span_start = Column(Integer, default=0)
    span_end = Column(Integer, default=0)
    issue = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    source_type = Column(String(50), nullable=False) # rule, fact, asset
    source_id = Column(String(36), nullable=False)
    suggestion = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="open") # open, accepted, edited, rejected, disputed
    user_edit = Column(Text, nullable=True) # if creator edited suggestion

    review = relationship("Review", back_populates="findings")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    review_id = Column(String(36), ForeignKey("reviews.id"), nullable=True)
    finding_id = Column(String(36), ForeignKey("findings.id"), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    review_id = Column(String(36), ForeignKey("reviews.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    outcome = Column(String(50), nullable=False) # approved, changes_requested
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    review = relationship("Review", back_populates="decisions")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    actor_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    target = Column(String(100), nullable=False)
    payload = Column(JSON, default=dict)
    prev_hash = Column(String(64), nullable=True)
    hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
