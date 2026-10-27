import re
import math
from typing import List, Dict, Any
from ..schemas import FindingCreate, SpanSchema, SourceSchema

def count_syllables(word: str) -> int:
    word = word.lower().strip(".:;?!")
    if not word:
        return 0
    if len(word) <= 3:
        return 1
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    word = re.sub(r'^y', '', word)
    matches = re.findall(r'[aeiouy]{1,2}', word)
    return max(1, len(matches))

def calculate_flesch_reading_ease(text: str) -> float:
    words = re.findall(r'\b[A-Za-z0-9\'-]+\b', text)
    sentences = re.split(r'[\.\?!]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not words or not sentences:
        return 100.0

    total_syllables = sum(count_syllables(w) for w in words)
    words_per_sentence = len(words) / len(sentences)
    syllables_per_word = total_syllables / len(words)

    score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    return round(score, 1)

def srgb_luminance(r: int, g: int, b: int) -> float:
    def adjust(channel):
        val = channel / 255.0
        return val / 12.92 if val <= 0.03928 else math.pow((val + 0.055) / 1.055, 2.4)
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def parse_hex_color(hex_str: str):
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    if len(hex_str) != 6:
        return None
    try:
        r = int(hex_str[0:2], 16)
        g = int(hex_str[2:4], 16)
        b = int(hex_str[4:6], 16)
        return r, g, b
    except ValueError:
        return None

def compute_contrast_ratio(hex1: str, hex2: str) -> float:
    c1 = parse_hex_color(hex1)
    c2 = parse_hex_color(hex2)
    if not c1 or not c2:
        return 1.0
    l1 = srgb_luminance(*c1)
    l2 = srgb_luminance(*c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return round(ratio, 2)

class DeterministicChecker:
    @staticmethod
    def run_all(
        text: str,
        rules: List[Any],
        terms: List[Any],
        assets: List[Any],
        metadata: Dict[str, Any] = None
    ) -> List[FindingCreate]:
        findings: List[FindingCreate] = []

        # Find rule IDs by category for accurate citation
        rule_map = {r.category: r.id for r in rules}
        term_rule_id = rule_map.get("terminology", "rule-term-01")
        tone_rule_id = rule_map.get("tone", "rule-tone-01")
        access_rule_id = rule_map.get("accessibility", "rule-access-01")
        visual_rule_id = rule_map.get("visual", "rule-visual-01")

        # 1. Terminology checks
        for term in terms:
            for banned in term.banned_variants:
                # Word-boundary search; if banned is a prefix of preferred (e.g. 'Nimbus' in 'Nimbus Coffee'),
                # do not match if it's already followed by the remainder of preferred term.
                if term.preferred.lower().startswith(banned.lower() + " "):
                    remainder = term.preferred[len(banned):].strip()
                    pattern = rf'\b{re.escape(banned)}\b(?!\s+{re.escape(remainder)})'
                else:
                    pattern = rf'\b{re.escape(banned)}\b'

                for m in re.finditer(pattern, text, re.IGNORECASE):
                    matched_text = m.group(0)
                    suggestion = term.preferred
                    if matched_text.isupper():
                        suggestion = term.preferred.upper()
                    elif matched_text[0].isupper() and not term.preferred.isupper():
                        suggestion = term.preferred

                    findings.append(FindingCreate(
                        type="terminology",
                        severity="medium",
                        confidence=1.0,
                        span=SpanSchema(start=m.start(), end=m.end()),
                        issue=f"Banned term: '{matched_text}'",
                        explanation=f"Brand guidelines require using '{term.preferred}' instead of '{banned}'. {term.note or ''}".strip(),
                        source=SourceSchema(type="rule", id=term.rule_id or term_rule_id),
                        suggestion=suggestion
                    ))

        # Check for isolated "Nimbus" or "NimbusCo" without "Coffee"
        # Rule: "always write 'Nimbus Coffee' (not 'Nimbus' or 'NimbusCo')"
        nimbus_matches = re.finditer(r'\bNimbus(?:Co)?\b(?!\s+Coffee)', text, re.IGNORECASE)
        for m in nimbus_matches:
            # Check if this span is already flagged
            already_flagged = any(f.span.start <= m.start() < f.span.end for f in findings)
            if not already_flagged:
                findings.append(FindingCreate(
                    type="terminology",
                    severity="high",
                    confidence=1.0,
                    span=SpanSchema(start=m.start(), end=m.end()),
                    issue=f"Improper brand name: '{m.group(0)}'",
                    explanation="Always write 'Nimbus Coffee' in full, not 'Nimbus' or 'NimbusCo'.",
                    source=SourceSchema(type="rule", id=term_rule_id),
                    suggestion="Nimbus Coffee"
                ))

        # 2. Exclamation mark rule: "never use exclamation marks more than once"
        excl_matches = list(re.finditer(r'!', text))
        if len(excl_matches) > 1:
            # Flag the second and subsequent exclamation marks
            for m in excl_matches[1:]:
                findings.append(FindingCreate(
                    type="tone",
                    severity="medium",
                    confidence=1.0,
                    span=SpanSchema(start=m.start(), end=m.end()),
                    issue="Excessive exclamation marks",
                    explanation="Brand guideline strictly permits at most one exclamation mark per communication piece.",
                    source=SourceSchema(type="rule", id=tone_rule_id),
                    suggestion="."
                ))

        # 3. Direct competitor comparison check
        # Rule: "never compare directly to named competitors"
        competitors = ["Starbucks", "Blue Tokai", "Third Wave", "Dunkin", "Costa", "Nescafe", "Tim Hortons"]
        for comp in competitors:
            for m in re.finditer(rf'\b{re.escape(comp)}\b', text, re.IGNORECASE):
                findings.append(FindingCreate(
                    type="messaging",
                    severity="high",
                    confidence=0.95,
                    span=SpanSchema(start=m.start(), end=m.end()),
                    issue=f"Named competitor reference: '{m.group(0)}'",
                    explanation="Brand policy strictly prohibits direct comparative advertising or mentioning named competitors.",
                    source=SourceSchema(type="rule", id=rule_map.get("messaging", "rule-msg-01")),
                    suggestion=""
                ))

        # 4. Reading accessibility check (Flesch score)
        flesch = calculate_flesch_reading_ease(text)
        if len(text.split()) > 30 and flesch < 35.0:
            findings.append(FindingCreate(
                type="accessibility",
                severity="low",
                confidence=0.9,
                span=SpanSchema(start=0, end=min(len(text), 60)),
                issue=f"Low Reading Ease (Score: {flesch}/100)",
                explanation=f"Text complexity is overly dense for general marketing copy (Flesch score: {flesch}). Simplify complex sentences to improve readability.",
                source=SourceSchema(type="rule", id=access_rule_id),
                suggestion=None
            ))

        # 5. Metadata / Image checks if provided
        if metadata:
            if metadata.get("is_image"):
                # Missing alt text
                alt_text = metadata.get("alt_text", "")
                if not alt_text or alt_text.lower() in ["image", "banner", "photo", "picture"]:
                    findings.append(FindingCreate(
                        type="accessibility",
                        severity="high",
                        confidence=1.0,
                        span=SpanSchema(start=0, end=min(len(text), 20)),
                        issue="Missing or non-descriptive alt text",
                        explanation="Accessibility requirement: All image assets must include descriptive alternative text for screen readers.",
                        source=SourceSchema(type="rule", id=access_rule_id),
                        suggestion="Add descriptive alt text describing the banner imagery and key text."
                    ))

                # Contrast check if foreground and background colors provided
                fg = metadata.get("foreground_color")
                bg = metadata.get("background_color")
                if fg and bg:
                    ratio = compute_contrast_ratio(fg, bg)
                    if ratio < 4.5:
                        findings.append(FindingCreate(
                            type="accessibility",
                            severity="high",
                            confidence=1.0,
                            span=SpanSchema(start=0, end=min(len(text), 20)),
                            issue=f"Insufficient contrast ratio ({ratio}:1)",
                            explanation=f"WCAG 2.1 AA requires minimum 4.5:1 contrast for regular text. Current contrast between {fg} and {bg} is only {ratio}:1.",
                            source=SourceSchema(type="rule", id=access_rule_id),
                            suggestion=f"Adjust colors to meet 4.5:1 ratio (e.g. use brand dark '#1A120B' over '#FFFFFF')."
                        ))

        return findings
