import re
from typing import Tuple, Dict

EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b')

def redact_personal_data(text: str) -> Tuple[str, Dict[str, str], int]:
    """
    Redacts personal data patterns (emails, phone numbers) before sending text to external LLMs.
    Returns:
        redacted_text: Text with [REDACTED_EMAIL_X] and [REDACTED_PHONE_X] markers
        replacements: Dict mapping marker -> original string
        redaction_count: Total items redacted
    """
    replacements = {}
    counter = 1

    def replace_email(match):
        nonlocal counter
        original = match.group(0)
        marker = f"[REDACTED_EMAIL_{counter}]"
        replacements[marker] = original
        counter += 1
        return marker

    def replace_phone(match):
        nonlocal counter
        original = match.group(0)
        # Avoid matching simple numbers like "100 outlets" or "2018"
        digits_only = re.sub(r'\D', '', original)
        if len(digits_only) < 7:
            return original
        marker = f"[REDACTED_PHONE_{counter}]"
        replacements[marker] = original
        counter += 1
        return marker

    redacted = EMAIL_REGEX.sub(replace_email, text)
    redacted = PHONE_REGEX.sub(replace_phone, redacted)
    return redacted, replacements, len(replacements)

def restore_personal_data(text: str, replacements: Dict[str, str]) -> str:
    restored = text
    for marker, original in replacements.items():
        restored = restored.replace(marker, original)
    return restored
