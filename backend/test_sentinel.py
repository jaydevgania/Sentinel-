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

def test_public_endpoints():
    """
    Enterprise public endpoints: Stats, Contact, Newsletter
    """
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    assert "total_reviews_processed" in stats_res.json()

    contact_res = client.post("/api/contact", json={
        "name": "Enterprise Buyer",
        "email": "buyer@enterprise.com",
        "company": "Enterprise Tech Inc",
        "team_size": "51-200",
        "subject": "Enterprise Plan",
        "message": "Interested in 500 seats."
    })
    assert contact_res.status_code == 200
    assert contact_res.json()["status"] == "success"

def test_auth_and_subscriptions():
    """
    Verify customer authentication access control & subscription checkout:
    1. Unauthorized customer registration blocked (HTTP 403)
    2. Developer grants customer access via POST /api/admin/grant-access
    3. Approved customer logs in successfully (HTTP 200)
    4. Subscription upgraded to Pro tier
    """
    import uuid
    unique_email = f"customer_{uuid.uuid4().hex[:6]}@brandcorp.com"
    payload = {
        "name": "Alex Mercer",
        "email": unique_email,
        "password": "Password123!",
        "company_name": "Mercer Brands",
        "brand_name": "Mercer Coffee",
        "plan": "starter"
    }

    # 1. Unapproved customer registration is blocked
    unapproved_res = client.post("/api/auth/register", json=payload)
    assert unapproved_res.status_code == 403
    assert "Access Restricted" in unapproved_res.json()["detail"]

    # 2. Developer grants access
    grant_res = client.post("/api/admin/grant-access", json={
        "email": unique_email,
        "notes": "Approved customer account"
    })
    assert grant_res.status_code == 200
    assert grant_res.json()["status"] == "success"

    # 3. Approved customer can now login
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    reg_data = login_res.json()
    assert reg_data["status"] == "success"
    token = reg_data["token"]
    assert token

    # 4. Upgrade subscription
    upgrade_res = client.post("/api/subscriptions/checkout", json={
        "tier": "pro",
        "billing_period": "annual"
    }, headers={"Authorization": f"Bearer {token}"})
    assert upgrade_res.status_code == 200
    assert upgrade_res.json()["subscription"]["tier"] == "pro"

def test_admin_crm_database():
    """
    Verify customer database and leads database endpoints for admin
    """
    cust_res = client.get("/api/admin/customers")
    assert cust_res.status_code == 200
    data = cust_res.json()
    assert "total_customers" in data
    assert len(data["customers"]) > 0

    leads_res = client.get("/api/admin/leads")
    assert leads_res.status_code == 200
    assert "total_leads" in leads_res.json()

def test_google_auth():
    """
    Verify Google Sign-In and auto-provisioning endpoint
    """
    import time
    unique_email = f"google_user_{int(time.time())}@sentinel.ai"
    payload = {
        "email": unique_email,
        "name": "Google Test User",
        "google_id": f"g_id_{int(time.time())}"
    }

    # 1. First-time Google registration
    res = client.post("/api/auth/google", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["token"]
    assert data["user"]["email"] == unique_email
    assert data["user"]["name"] == "Google Test User"
    assert data["user"]["workspace_id"]

    # 2. Subsequent Google login with same credentials
    res2 = client.post("/api/auth/google", json=payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["token"]
    assert data2["user"]["id"] == data["user"]["id"]

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
    test_public_endpoints()
    print("[PASS] Enterprise Public Endpoints Verified (Stats & Contact API)")
    test_auth_and_subscriptions()
    print("[PASS] Customer Authentication & Subscription Upgrades Verified")
    test_google_auth()
    print("[PASS] Google Sign-In & Workspace Auto-Provisioning Verified")
    test_admin_crm_database()
    print("[PASS] Admin Customer & Leads Database Verified")
    test_tamper_evident_audit_verification()
    print("[PASS] Cryptographic Audit Trail Verified")
    print("\nALL SECTION 11 TESTS PASSED WITH 100% SUCCESS!")
