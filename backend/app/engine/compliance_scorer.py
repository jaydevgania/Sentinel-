from typing import List, Dict, Any, Tuple
from ..schemas import FindingCreate

SEVERITY_WEIGHTS = {
    "high": 18,
    "medium": 10,
    "low": 4
}

CATEGORIES = ["claim", "tone", "terminology", "messaging", "accessibility", "visual"]

def calculate_compliance_score(findings: List[FindingCreate]) -> Tuple[int, Dict[str, Any]]:
    category_penalties = {cat: 0 for cat in CATEGORIES}
    total_penalty = 0

    for f in findings:
        cat = f.type.lower()
        if cat not in category_penalties:
            category_penalties[cat] = 0

        penalty = SEVERITY_WEIGHTS.get(f.severity.lower(), 10)
        category_penalties[cat] += penalty
        total_penalty += penalty

    # Overall score (0 to 100)
    score = max(0, min(100, 100 - total_penalty))

    # Category score breakdown (each 0 to 100)
    category_scores = {}
    for cat in CATEGORIES:
        pen = category_penalties.get(cat, 0)
        category_scores[cat] = max(0, min(100, 100 - pen * 2))

    if score >= 90:
        grade = "A"
        status = "Compliant"
    elif score >= 75:
        grade = "B"
        status = "Minor Issues"
    elif score >= 50:
        grade = "C"
        status = "Needs Revision"
    else:
        grade = "F"
        status = "Non-Compliant"

    breakdown = {
        "score": score,
        "grade": grade,
        "status": status,
        "categories": category_scores,
        "total_issues": len(findings),
        "high_severity_count": sum(1 for f in findings if f.severity.lower() == "high"),
        "medium_severity_count": sum(1 for f in findings if f.severity.lower() == "medium"),
        "low_severity_count": sum(1 for f in findings if f.severity.lower() == "low")
    }

    return score, breakdown
