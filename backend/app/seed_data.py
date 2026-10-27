from sqlalchemy.orm import Session
from .models import Workspace, User, Rule, Term, Fact, Asset, Content, ContentVersion, Review, Finding
from .engine.audit import record_audit_event

DEMO_WORKSPACE_ID = "ws-nimbus-demo-001"
CREATOR_USER_ID = "usr-creator-alex"
MANAGER_USER_ID = "usr-manager-jordan"
REVIEWER_USER_ID = "usr-reviewer-morgan"

SAMPLE_POSTS = [
    {
        "id": "sample-1",
        "title": "1. Unsupported Claim",
        "category": "Claim Check",
        "description": "Claims 'world's best coffee' with no verified factual grounding.",
        "text": "Come taste the world's best coffee at Nimbus Coffee! Our craft cold brew is steeped for 18 hours and will change how you view caffeine forever.",
        "channel": "instagram",
        "purpose": "Promotional launch announcement",
        "metadata": {}
    },
    {
        "id": "sample-2",
        "title": "2. Contradicts Fact",
        "category": "Fact Verification",
        "description": "Claims '100 outlets' which directly contradicts verified fact of 40 outlets.",
        "text": "Huge milestone! Nimbus Coffee is proud to announce we now have 100 outlets across the country! Visit your nearest store today.",
        "channel": "press_release",
        "purpose": "Company Milestone Announcement",
        "metadata": {}
    },
    {
        "id": "sample-3",
        "title": "3. Terminology Violations",
        "category": "Terminology",
        "description": "Uses banned variants 'staff' instead of 'team members' and 'NimbusCo'.",
        "text": "A huge shoutout to our hardworking staff at NimbusCo for making this holiday festival so special for every guest who walked in.",
        "channel": "internal",
        "purpose": "Employee Appreciation Note",
        "metadata": {}
    },
    {
        "id": "sample-4",
        "title": "4. Slang & Aggressive Tone",
        "category": "Tone Violation",
        "description": "Uses internet slang ('yo fam', 'fire', 'no cap') and multiple exclamation marks.",
        "text": "Yo fam, our brew is so fire, no cap fr fr!! Third Wave Coffee could never match our drip!! Pull up today and grab a cup!!",
        "channel": "instagram",
        "purpose": "Casual social hype post",
        "metadata": {}
    },
    {
        "id": "sample-5",
        "title": "5. Visual & Low-Contrast Banner",
        "category": "Accessibility & Visual",
        "description": "Banner graphic has 1.3:1 contrast ratio (#D5CEA3 on #E5E5CB) and missing alt text.",
        "text": "Limited seasonal drop: Nimbus Coffee brings you our slow roast blend crafted by our team members.",
        "channel": "website",
        "purpose": "Homepage Feature Banner",
        "metadata": {
            "is_image": True,
            "foreground_color": "#D5CEA3",
            "background_color": "#E5E5CB",
            "alt_text": ""
        }
    },
    {
        "id": "sample-6",
        "title": "6. Clean Compliant Post",
        "category": "Clean Pass",
        "description": "100% compliant post that demonstrates Sentinel does not over-flag.",
        "text": "Start your morning with a refreshing glass of cold brew, crafted with care by our dedicated team members at Nimbus Coffee. Ethically sourced from our partner farms and steeped for 18 hours.",
        "channel": "instagram",
        "purpose": "Morning Coffee Ritual Post",
        "metadata": {}
    }
]

def seed_demo_workspace(db: Session, force_reset: bool = False) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.id == DEMO_WORKSPACE_ID).first()
    if ws and not force_reset:
        return ws

    # Clean up any leftover demo entities to avoid UNIQUE constraint conflicts
    db.query(Asset).filter((Asset.workspace_id == DEMO_WORKSPACE_ID) | (Asset.id.in_(["asset-palette-01", "asset-logo-02", "asset-font-03"]))).delete(synchronize_session=False)
    db.query(Fact).filter((Fact.workspace_id == DEMO_WORKSPACE_ID) | (Fact.id.in_(["fact-founding-01", "fact-outlets-02", "fact-steep-03", "fact-beans-04"]))).delete(synchronize_session=False)
    db.query(Term).filter(Term.id.in_(["term-coldbrew-01", "term-teammembers-02", "term-brandname-03"])).delete(synchronize_session=False)
    db.query(Rule).filter((Rule.workspace_id == DEMO_WORKSPACE_ID) | (Rule.id.in_(["rule-tone-01", "rule-term-01", "rule-msg-01", "rule-access-01", "rule-visual-01"]))).delete(synchronize_session=False)
    db.query(User).filter(User.workspace_id == DEMO_WORKSPACE_ID).delete(synchronize_session=False)
    if ws:
        db.delete(ws)
    db.commit()

    # 1. Create Workspace
    workspace = Workspace(
        id=DEMO_WORKSPACE_ID,
        name="Nimbus Coffee Global",
        brand_name="Nimbus Coffee"
    )
    db.add(workspace)

    # 2. Users
    users = [
        User(id=CREATOR_USER_ID, workspace_id=DEMO_WORKSPACE_ID, name="Alex Vance", role="creator"),
        User(id=MANAGER_USER_ID, workspace_id=DEMO_WORKSPACE_ID, name="Jordan Lee", role="manager"),
        User(id=REVIEWER_USER_ID, workspace_id=DEMO_WORKSPACE_ID, name="Morgan Reed", role="reviewer")
    ]
    db.add_all(users)

    # 3. Rules
    rule_tone = Rule(
        id="rule-tone-01",
        workspace_id=DEMO_WORKSPACE_ID,
        category="tone",
        clause_text="Tone must be friendly, welcoming and approachable, but never slangy or hyper-informal; never use exclamation marks more than once per post.",
        severity="medium",
        source_doc="Nimbus Coffee Brand Book 2026, Section 2.1"
    )
    rule_term = Rule(
        id="rule-term-01",
        workspace_id=DEMO_WORKSPACE_ID,
        category="terminology",
        clause_text="Always write 'Nimbus Coffee' in full (never 'Nimbus' or 'NimbusCo'). Store workers must be referred to as 'team members', not 'staff'.",
        severity="high",
        source_doc="Nimbus Coffee Brand Book 2026, Section 2.4"
    )
    rule_messaging = Rule(
        id="rule-msg-01",
        workspace_id=DEMO_WORKSPACE_ID,
        category="messaging",
        clause_text="Never compare directly to named competitors; avoid unsubstantiated superlative claims ('the world's best').",
        severity="high",
        source_doc="Legal & Regulatory Advertising Guidelines, Section 4"
    )
    rule_access = Rule(
        id="rule-access-01",
        workspace_id=DEMO_WORKSPACE_ID,
        category="accessibility",
        clause_text="Primary color and text must meet WCAG AA contrast (minimum 4.5:1 ratio); all digital images must have descriptive alt text.",
        severity="high",
        source_doc="Global Digital Accessibility Standards v3"
    )
    rule_visual = Rule(
        id="rule-visual-01",
        workspace_id=DEMO_WORKSPACE_ID,
        category="visual",
        clause_text="Brand visual identity must adhere to the official Nimbus Coffee palette and typography.",
        severity="medium",
        source_doc="Visual Identity System 2026"
    )

    db.add_all([rule_tone, rule_term, rule_messaging, rule_access, rule_visual])
    db.flush()

    # 4. Terms
    terms = [
        Term(
            id="term-coldbrew-01",
            preferred="cold brew",
            banned_variants=["iced coffee concentrate", "liquid coffee concentrate", "instant brew"],
            note="Nimbus Coffee steeps coarse grind whole beans for 18 hours; we never use concentrates.",
            rule_id=rule_term.id
        ),
        Term(
            id="term-teammembers-02",
            preferred="team members",
            banned_variants=["staff", "employees", "workers", "crew members"],
            note="Respectful, inclusive community language is fundamental to our hospitality ethos.",
            rule_id=rule_term.id
        ),
        Term(
            id="term-brandname-03",
            preferred="Nimbus Coffee",
            banned_variants=["Nimbus", "NimbusCo", "Nimbus Cafe"],
            note="Always use the complete registered trademark name 'Nimbus Coffee'.",
            rule_id=rule_term.id
        )
    ]
    db.add_all(terms)

    # 5. Approved Facts
    facts = [
        Fact(
            id="fact-founding-01",
            workspace_id=DEMO_WORKSPACE_ID,
            statement="Nimbus Coffee was founded in 2018.",
            source="Corporate Filing Certificate 2018-A",
            valid_from="2018-01-01",
            valid_to="2099-12-31"
        ),
        Fact(
            id="fact-outlets-02",
            workspace_id=DEMO_WORKSPACE_ID,
            statement="Nimbus Coffee operates 40 outlets across 6 cities.",
            source="Q3 2026 Operations Audit (Internal Doc 441)",
            valid_from="2026-07-01",
            valid_to="2026-12-31"
        ),
        Fact(
            id="fact-steep-03",
            workspace_id=DEMO_WORKSPACE_ID,
            statement="Nimbus Coffee cold brew is steeped for 18 hours in triple-filtered cold water.",
            source="Master Brewing Standard Recipe Manual",
            valid_from="2018-01-01",
            valid_to="2099-12-31"
        ),
        Fact(
            id="fact-beans-04",
            workspace_id=DEMO_WORKSPACE_ID,
            statement="100% of our coffee beans are ethically sourced from named single-origin partner farms in Colombia, Ethiopia, and Karnataka.",
            source="Annual Sustainability & Fair Trade Audit 2025",
            valid_from="2025-01-01",
            valid_to="2026-12-31"
        )
    ]
    db.add_all(facts)

    # 6. Brand Assets
    assets = [
        Asset(
            id="asset-palette-01",
            workspace_id=DEMO_WORKSPACE_ID,
            type="palette",
            value="#3C2A21, #D5CEA3, #E5E5CB, #1A120B",
            usage_notes="Espresso Roast (#3C2A21), Cream Oat (#D5CEA3), Canvas Linen (#E5E5CB), Midnight Dark (#1A120B)"
        ),
        Asset(
            id="asset-logo-02",
            workspace_id=DEMO_WORKSPACE_ID,
            type="logo",
            value="/assets/nimbus-coffee-mark.svg",
            usage_notes="Primary cloud-bean monogram. Maintain minimum clear space equal to 1x icon height."
        ),
        Asset(
            id="asset-font-03",
            workspace_id=DEMO_WORKSPACE_ID,
            type="font",
            value="Inter, Plus Jakarta Sans, sans-serif",
            usage_notes="Clean geometric modernist sans-serif for headings and UI."
        )
    ]
    db.add_all(assets)
    db.commit()

    # Record genesis audit event
    record_audit_event(
        db=db,
        actor_id="system",
        action="WORKSPACE_INITIALIZED",
        target=f"workspace:{DEMO_WORKSPACE_ID}",
        payload={"brand": "Nimbus Coffee", "rules_count": 5, "facts_count": 4, "terms_count": 3}
    )

    return workspace
