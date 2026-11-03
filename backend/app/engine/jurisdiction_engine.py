import re
from typing import List, Dict, Any, Optional
from ..schemas import FindingCreate, SpanSchema, SourceSchema

class JurisdictionRule:
    def __init__(self, code: str, title: str, authority: str, clause: str, pattern: str, severity: str, explanation: str, suggestion: str = None, is_allowlist: bool = False):
        self.code = code
        self.title = title
        self.authority = authority
        self.clause = clause
        self.pattern = pattern
        self.severity = severity
        self.explanation = explanation
        self.suggestion = suggestion
        self.is_allowlist = is_allowlist

# Jurisdictional Regulatory Knowledge Base
JURISDICTION_REGULATIONS = {
    "india_asci": [
        # ASCI Chapter I & IV: Misleading claims and superlative checks
        JurisdictionRule(
            code="ASCI-Ch1-Cl1.4",
            title="ASCI Misleading Superlative Prohibition",
            authority="Advertising Standards Council of India (ASCI)",
            clause="Advertisements shall not contain statements or visual presentations which directly or by implication mislead consumers about the product. Superlatives such as 'Number 1', 'Best', or 'Leading' require rigorous independent market substantiation.",
            pattern=r"\b(number\s+1|#1|the\s+best|leading|unmatched|most\s+trusted)\b",
            severity="high",
            explanation="ASCI Chapter I, Clause 1.4 prohibits absolute superlative claims without verifiable independent market audit data.",
            suggestion="a customer-favorite"
        ),
        # ASCI Influencer Guidelines: Mandatory disclosures for sponsored Indian posts
        JurisdictionRule(
            code="ASCI-Influencer-Cl2.1",
            title="ASCI Mandatory Influencer Ad Disclosure",
            authority="Advertising Standards Council of India (ASCI)",
            clause="All promotional and sponsored marketing content on digital media must carry an upfront prominent disclosure label (#ad, #collab, #promo, #sponsored, #partnership).",
            pattern=r"\b(collab|partnered\s+with|promo|deal\s+alert|discount\s+code)\b",
            severity="medium",
            explanation="ASCI Guidelines for Influencer Advertising require upfront prominent disclosure labels on all promotional posts.",
            suggestion="Add #ad or #collab at the start of your caption"
        ),
        # ASCI Environmental Claims: Greenwashing Guidelines 2024
        JurisdictionRule(
            code="ASCI-Green-2024",
            title="ASCI Green Claims Substantiation",
            authority="Advertising Standards Council of India (ASCI)",
            clause="Generic claims like 'eco-friendly', 'green', 'clean' must be substantiated by accredited environmental lifecycle assessment.",
            pattern=r"\b(eco-friendly|100%\s+green|zero-waste|purely\s+organic)\b",
            severity="high",
            explanation="ASCI 2024 Environmental Claims Code requires verifiable proof for sweeping green claims.",
            suggestion="responsibly sourced"
        )
    ],
    "us_ftc": [
        # FTC 16 CFR Part 255: Endorsement Guides
        JurisdictionRule(
            code="FTC-16-CFR-255",
            title="FTC Mandatory Endorsement & Ad Disclosure",
            authority="Federal Trade Commission (FTC)",
            clause="16 CFR Part 255 requires clear and conspicuous disclosure of material connections between advertisers and endorsers (#Ad, #Sponsored).",
            pattern=r"\b(affiliate|ambassador|partner|use\s+my\s+code|limited\s+time\s+offer)\b",
            severity="high",
            explanation="FTC Endorsement Guides (16 CFR Part 255) mandate clear, conspicuous #Ad disclosure above the fold.",
            suggestion="Add #Ad clearly at the beginning"
        ),
        # FTC Section 5: Unfair or Deceptive Acts (Unsubstantiated Health / Guarantee claims)
        JurisdictionRule(
            code="FTC-Sec5-Deception",
            title="FTC Substantiation Doctrine",
            authority="Federal Trade Commission (FTC)",
            clause="Section 5 of the FTC Act prohibits unfair or deceptive acts. Objective claims regarding product efficacy, health benefits, or absolute guarantees require competent and reliable scientific evidence prior to dissemination.",
            pattern=r"\b(guaranteed\s+cure|clinically\s+proven\s+to\s+cure|risk-free\s+guarantee|100%\s+effective)\b",
            severity="high",
            explanation="FTC Section 5 requires competent and reliable scientific or empirical evidence before publishing objective performance or health guarantees.",
            suggestion="designed to support wellness"
        )
    ],
    "eu_green": [
        # EU Directive 2024/825 (Empowering Consumers for the Green Transition & Green Claims)
        JurisdictionRule(
            code="EU-Directive-2024/825",
            title="EU Green Claims Directive (Anti-Greenwashing)",
            authority="European Union Parliament & Council",
            clause="Directive (EU) 2024/825 bans generic environmental claims like 'environmentally friendly', 'eco-friendly', 'carbon neutral', 'climate positive' without certified excellence or public verification schemes.",
            pattern=r"\b(carbon\s+neutral|climate\s+positive|eco-friendly|100%\s+sustainable|green\s+choice)\b",
            severity="high",
            explanation="EU Directive 2024/825 prohibits generic environmental assertions unless backed by recognized EU Ecolabel or official verification schemes.",
            suggestion="sustainably harvested with certified partners"
        ),
        # EU GDPR / Digital Services Act: Transparency on sponsored content
        JurisdictionRule(
            code="EU-DSA-Art26",
            title="EU DSA Commercial Communication Transparency",
            authority="European Commission (Digital Services Act)",
            clause="Article 26 requires clear identification of commercial communications, natural persons on whose behalf it is presented, and meaningful parameters.",
            pattern=r"\b(sponsored|commercial\s+promotion|giveaway)\b",
            severity="medium",
            explanation="EU Digital Services Act Article 26 mandates explicit commercial communication labelling.",
            suggestion="clearly declare commercial sponsorship"
        )
    ],
    "uk_asa": [
        # UK CAP Code Section 3: Misleading Advertising
        JurisdictionRule(
            code="UK-CAP-Code-Sec3",
            title="ASA CAP Code Rule 3.1 Misleading Advertising",
            authority="Advertising Standards Authority (ASA, UK)",
            clause="Marketing communications must not materially mislead consumers or be likely to do so. Advertisers must hold documentary evidence to prove all claims.",
            pattern=r"\b(best\s+in\s+the\s+uk|uk['’]s\s+#1|unrivalled|voted\s+best)\b",
            severity="high",
            explanation="UK CAP Code Rule 3.1 requires robust independent market data for superlative claims.",
            suggestion="highly rated by our customers"
        )
    ]
}

# Regional Idiomatic Tolerance (Indian English / Hinglish cultural voice protection)
# When ASCI / India mode is active, Sentinel does NOT penalize authentic cultural terms!
INDIAN_ENGLISH_ALLOWLIST = {
    "yaar": "Authentic regional colloquialism (friend/buddy). Preserved under ASCI Indian English Cultural Voice guidelines.",
    "jugaad": "Innovative problem solving. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "chai": "Traditional tea culture. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "pukka": "Genuine/solid. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "bindaas": "Carefree/bold. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "fundas": "Fundamentals/concepts. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "timepass": "Casual leisure. Preserved under ASCI Indian English Cultural Voice guidelines.",
    "prepone": "Advance schedule. Standard Indian English recognized vocabulary.",
    "lakh": "Indian numbering system (100,000). Standard Indian English terminology.",
    "crore": "Indian numbering system (10,000,000). Standard Indian English terminology."
}

class JurisdictionEngine:
    @staticmethod
    def get_supported_jurisdictions() -> List[Dict[str, str]]:
        return [
            {"id": "global", "name": "Global / General Brand Guidelines", "flag": "🌐", "description": "Standard brand rules, tone guidelines, and fact checking."},
            {"id": "india_asci", "name": "India (ASCI & Indian English Voice)", "flag": "🇮🇳", "description": "ASCI 2024-25 Advertising Code, influencer disclosure rules, and Indian English idiom preservation."},
            {"id": "us_ftc", "name": "United States (FTC 16 CFR Part 255)", "flag": "🇺🇸", "description": "FTC Endorsement Guides, truth-in-advertising substantiation, and #Ad disclosure enforcement."},
            {"id": "eu_green", "name": "European Union (EU Directive 2024/825 & GDPR)", "flag": "🇪🇺", "description": "EU Anti-Greenwashing Directive, eco-claim verification, and DSA commercial transparency."},
            {"id": "uk_asa", "name": "United Kingdom (ASA & CAP Code)", "flag": "🇬🇧", "description": "UK Advertising Standards Authority CAP Code Rule 3 substantiation and comparative claims."}
        ]

    @staticmethod
    def evaluate_jurisdiction(text: str, jurisdiction: str = "global") -> Dict[str, Any]:
        """
        Evaluates text against specific regulatory standards and cultural voice rules.
        Returns:
            jurisdiction_findings: List[FindingCreate]
            cultural_voice_notes: List[Dict[str, str]] (e.g., words protected from tone flagging)
        """
        findings: List[FindingCreate] = []
        cultural_notes: List[Dict[str, str]] = []

        if not jurisdiction or jurisdiction == "global":
            return {"findings": findings, "cultural_notes": cultural_notes}

        # Check regional cultural voice allowlist (e.g. India / Hinglish)
        if jurisdiction == "india_asci":
            for idiom, rationale in INDIAN_ENGLISH_ALLOWLIST.items():
                pattern = rf"\b{re.escape(idiom)}\b"
                for m in re.finditer(pattern, text, re.IGNORECASE):
                    cultural_notes.append({
                        "term": m.group(0),
                        "span": [m.start(), m.end()],
                        "status": "CULTURALLY_PROTECTED",
                        "rationale": rationale
                    })

        # Check regulatory rules
        rules = JURISDICTION_REGULATIONS.get(jurisdiction, [])
        for rule in rules:
            for m in re.finditer(rule.pattern, text, re.IGNORECASE):
                # Don't flag if it's protected by cultural voice
                matched_str = m.group(0).lower()
                if jurisdiction == "india_asci" and matched_str in INDIAN_ENGLISH_ALLOWLIST:
                    continue

                findings.append(FindingCreate(
                    type="claim" if "ASCI" in rule.code or "FTC" in rule.code or "EU" in rule.code else "messaging",
                    severity=rule.severity,
                    confidence=0.96,
                    span=SpanSchema(start=m.start(), end=m.end()),
                    issue=f"[{rule.code}] {rule.title}",
                    explanation=f"{rule.explanation} Policy clause: \"{rule.clause[:150]}...\"",
                    source=SourceSchema(type="rule", id=rule.code),
                    suggestion=rule.suggestion
                ))

        return {
            "findings": findings,
            "cultural_notes": cultural_notes,
            "jurisdiction": jurisdiction
        }
