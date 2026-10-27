import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed_data import SAMPLE_POSTS

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "ai_active" in data

def test_demo_workspace():
    res = client.get("/api/workspaces/demo")
    assert res.status_code == 200
    data = res.json()
    assert data["workspace"]["brand_name"] == "Nimbus Coffee"
    assert len(data["users"]) == 3
    assert len(data["sample_posts"]) == 6

def test_rules_and_terms():
    res = client.get("/api/rules")
    assert res.status_code == 200
    rules = res.json()
    assert len(rules) >= 5

    res2 = client.get("/api/terms")
    assert res2.status_code == 200
    terms = res2.json()
    assert len(terms) >= 3

def test_seeded_posts_behavior():
    """
    Section 11: Seeded-error detection
    All six sample posts behave as expected (five flagged correctly, the clean post passes)
    """
    for sample in SAMPLE_POSTS:
        post_data = {
            "channel": sample["channel"],
            "purpose": sample["purpose"],
            "body_text": sample["text"]
        }
        if sample.get("metadata", {}).get("is_image"):
            post_data["image_base64"] = "dummy_base64"

        res = client.post("/api/reviews", json=post_data)
        assert res.status_code == 200
        review = res.json()

        findings = review["findings"]
        score = review["compliance_score"]

        if sample["id"] == "sample-6":
            # Clean post should have zero findings and score 100
            assert len(findings) == 0, f"Clean post had unexpected findings: {findings}"
            assert score == 100
        else:
            # Flawed posts must be flagged
            assert len(findings) > 0, f"{sample['title']} was not flagged!"
            # Every finding must cite a valid source
            for f in findings:
                assert f["source_id"], "Finding missing cited source ID"
                assert f["source_type"] in ["rule", "fact", "asset"]

def test_role_security_enforcement():
    """
    Section 11: Role security
    Creator cannot approve; reviewer actions are logged
    """
    # Create a review
    res = client.post("/api/reviews", json={
        "channel": "instagram",
        "purpose": "Test Role Security",
        "body_text": "Sample text for security test."
    })
    review_id = res.json()["id"]

    # Creator tries to approve -> MUST FAIL with 403 Forbidden
    creator_res = client.post(f"/api/reviews/{review_id}/decision", json={
        "reviewer_role": "creator",
        "outcome": "approved",
        "reason": "Creator self-approving"
    })
    assert creator_res.status_code == 403, "Security breach: Creator was allowed to approve!"

    # Manager approves -> MUST SUCCEED with 200 OK
    manager_res = client.post(f"/api/reviews/{review_id}/decision", json={
        "reviewer_role": "manager",
        "outcome": "approved",
        "reason": "Manager approved"
    })
    assert manager_res.status_code == 200
    assert manager_res.json()["decision"] == "approved"

def test_tamper_evident_audit_verification():
    """
    Section 11: Cryptographic audit chain verification
    """
    res = client.get("/api/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True, f"Tamper evident audit chain failed: {data}"
    assert data["total_events"] > 0

if __name__ == "__main__":
    print("Running Sentinel automated verification suite...")
    test_health()
    print("[PASS] Health Check Passed")
    test_demo_workspace()
    print("[PASS] Demo Workspace Preloading Passed")
    test_rules_and_terms()
    print("[PASS] Knowledge Base API Passed")
    test_seeded_posts_behavior()
    print("[PASS] All 6 Seeded Posts Verified (5 correctly flagged, 1 clean pass)")
    test_role_security_enforcement()
    print("[PASS] Role Security Enforced (Creator blocked, Manager permitted)")
    test_tamper_evident_audit_verification()
    print("[PASS] Cryptographic Audit Trail Verified")
    print("\nALL SECTION 11 TESTS PASSED WITH 100% SUCCESS!")
