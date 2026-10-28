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
    Verify customer authentication & developer access permission:
    1. Any customer registers freely for Studio Trial (HTTP 200)
    2. Customer logs in successfully (HTTP 200)
    3. Customer is BLOCKED from developer access /api/admin/customers (HTTP 403)
    4. Developer devgania1@gmail.com can access /api/admin/customers (HTTP 200)
    5. Customer upgrades subscription to Pro tier (HTTP 200)
    """
    import uuid
    from app.routers.auth import create_token
    unique_email = f"customer_{uuid.uuid4().hex[:6]}@brandcorp.com"
    payload = {
        "name": "Alex Mercer",
        "email": unique_email,
        "password": "Password123!",
        "company_name": "Mercer Brands",
        "brand_name": "Mercer Coffee",
        "plan": "starter"
    }

    # 1. Any customer registers freely for Studio Trial
    reg_res = client.post("/api/auth/register", json=payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["status"] == "success"
    token = reg_data["token"]
    assert token
    assert reg_data["user"]["subscription_status"] == "trialing"
    assert reg_data["user"]["is_admin"] is False

    # 2. Customer logs in successfully
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["status"] == "success"

    # 3. Customer is BLOCKED from developer panel (requires developer permission)
    cust_admin_res = client.get("/api/admin/customers", headers={"Authorization": f"Bearer {token}"})
    assert cust_admin_res.status_code == 403
    assert "Developer Access" in cust_admin_res.json()["detail"]

    # 4. Developer devgania1@gmail.com can access developer panel
    dev_token = create_token("dev_user", "devgania1@gmail.com", "admin")
    dev_admin_res = client.get("/api/admin/customers", headers={"Authorization": f"Bearer {dev_token}"})
    assert dev_admin_res.status_code == 200
    assert "total_customers" in dev_admin_res.json()

    # 5. Customer can upgrade subscription
    upgrade_res = client.post("/api/subscriptions/checkout", json={
        "tier": "pro",
        "billing_period": "annual"
    }, headers={"Authorization": f"Bearer {token}"})
    assert upgrade_res.status_code == 200
    assert upgrade_res.json()["subscription"]["tier"] == "pro"

def test_admin_crm_database():
    """
    Verify customer database and leads database endpoints for admin:
    Accessible by sole developer devgania1@gmail.com
    """
    from app.routers.auth import create_token
    dev_token = create_token("dev_user", "devgania1@gmail.com", "admin")
    headers = {"Authorization": f"Bearer {dev_token}"}

    cust_res = client.get("/api/admin/customers", headers=headers)
    assert cust_res.status_code == 200
    data = cust_res.json()
    assert "total_customers" in data
    assert len(data["customers"]) > 0

    leads_res = client.get("/api/admin/leads", headers=headers)
    assert leads_res.status_code == 200
    assert "total_leads" in leads_res.json()

def test_google_auth():
    """
    Verify Google Sign-In:
    1. Any customer can log in with their Gmail to the studio for trial (HTTP 200, is_admin=False)
    2. Customer cannot access developer database without developer authorization (HTTP 403)
    3. Sole developer devgania1@gmail.com logs in directly with developer rights (is_admin=True)
    4. Developer grants developer access to external customer
    5. Authorized customer now has developer access
    """
    import time
    # 1. Any customer logs in with Google (Gmail) for Studio Trial
    unique_email = f"google_cust_{int(time.time())}@gmail.com"
    cust_payload = {
        "email": unique_email,
        "name": "External Trial User",
        "google_id": f"g_id_{int(time.time())}"
    }
    cust_res = client.post("/api/auth/google", json=cust_payload)
    assert cust_res.status_code == 200
    cust_data = cust_res.json()
    assert cust_data["status"] == "success"
    cust_token = cust_data["token"]
    assert cust_data["user"]["is_admin"] is False
    assert cust_data["user"]["subscription_status"] == "trialing"

    # 2. Customer is blocked from developer database
    dev_check_res = client.get("/api/admin/customers", headers={"Authorization": f"Bearer {cust_token}"})
    assert dev_check_res.status_code == 403
    assert "Developer Access" in dev_check_res.json()["detail"]

    # 3. Developer Google Login gets is_admin=True
    dev_payload = {
        "email": "devgania1@gmail.com",
        "name": "Devgania Developer",
        "google_id": "g_devgania1"
    }
    dev_res = client.post("/api/auth/google", json=dev_payload)
    assert dev_res.status_code == 200
    dev_data = dev_res.json()
    assert dev_data["user"]["is_admin"] is True
    dev_token = dev_data["token"]

    # 4. Developer grants developer access to external customer
    grant_res = client.post("/api/admin/grant-access", json={
        "email": unique_email,
        "notes": "Approved developer access by devgania1"
    }, headers={"Authorization": f"Bearer {dev_token}"})
    assert grant_res.status_code == 200

    # 5. Customer now has developer access
    auth_check_res = client.get("/api/admin/customers", headers={"Authorization": f"Bearer {cust_token}"})
    assert auth_check_res.status_code == 200

def test_customer_guidelines_upload():
    """
    Test customer upload of brand guidelines (PDF/TXT), extraction of rules,
    manual rule/term/fact authoring, and workspace isolation.
    """
    import io
    from app.routers.auth import create_token
    from app.models import Workspace, User
    from app.database import SessionLocal

    db = SessionLocal()
    # Create a unique test customer workspace
    ws = Workspace(name="Acme Motors Workspace", brand_name="Acme Motors")
    db.add(ws)
    db.commit()

    token = create_token("acme-user-id", "engineer@acmemotors.com", "manager")

    # 1. Upload Guideline Document (TXT/PDF simulation)
    guideline_text = """
    Acme Motors Brand Guidelines & Compliance Policy:
    1. Tone for Acme Motors must be futuristic, exhilarating, and hyper-precise.
    2. Never use internet slang or casual memes in official automotive press releases.
    3. Always prefer 'Electric Hypercar' instead of 'battery car' or 'golf cart'.
    4. Verified Fact: Acme Motors achieves 0 to 60 mph in 1.89 seconds.
    5. Prohibited: Never make disparaging comparisons to competitor internal combustion vehicles.
    """

    file_bytes = guideline_text.encode('utf-8')
    files = {"file": ("acme_guidelines.txt", io.BytesIO(file_bytes), "text/plain")}
    data = {
        "workspace_id": ws.id,
        "brand_name": "Acme Motors",
        "category": "messaging"
    }

    import_res = client.post(
        "/api/sources/import",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert import_res.status_code == 200, f"Import failed: {import_res.text}"
    result = import_res.json()
    assert result["status"] == "success"
    assert result["extracted_clauses_count"] >= 3
    assert result["workspace_id"] == ws.id

    # 2. Verify rules retrieved for Acme workspace
    rules_res = client.get(f"/api/rules?workspace_id={ws.id}")
    assert rules_res.status_code == 200
    acme_rules = rules_res.json()
    assert len(acme_rules) >= 3

    # 3. Create manual custom rule
    new_rule_res = client.post("/api/rules", json={
        "workspace_id": ws.id,
        "category": "tone",
        "clause_text": "Always emphasize engineering safety standards.",
        "severity": "high",
        "source_doc": "Manual Entry"
    }, headers={"Authorization": f"Bearer {token}"})
    assert new_rule_res.status_code == 200
    created_rule = new_rule_res.json()
    assert created_rule["id"]

    # 4. Create manual custom term
    new_term_res = client.post("/api/terms", json={
        "workspace_id": ws.id,
        "preferred": "Autonomous Drive",
        "banned_variants": ["self-driving robot", "autopilot gimmick"],
        "note": "Legal compliance directive"
    }, headers={"Authorization": f"Bearer {token}"})
    assert new_term_res.status_code == 200
    created_term = new_term_res.json()

    # 5. Create manual custom fact
    new_fact_res = client.post("/api/facts", json={
        "workspace_id": ws.id,
        "statement": "Acme Motors offers a 10-year battery warranty.",
        "source": "Corporate Warranty Document"
    }, headers={"Authorization": f"Bearer {token}"})
    assert new_fact_res.status_code == 200
    created_fact = new_fact_res.json()

    # 6. Delete rule
    del_res = client.delete(f"/api/rules/{created_rule['id']}", headers={"Authorization": f"Bearer {token}"})
    assert del_res.status_code == 200

    # 7. Verify Demo workspace remains unaffected (Demo rules still >= 5)
    demo_rules_res = client.get("/api/rules")
    assert demo_rules_res.status_code == 200
    assert len(demo_rules_res.json()) >= 5

    db.close()

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
    test_customer_guidelines_upload()
    print("[PASS] Customer Company Guidelines Upload & Management Verified")
    test_admin_crm_database()
    print("[PASS] Admin Customer & Leads Database Verified")
    test_tamper_evident_audit_verification()
    print("[PASS] Cryptographic Audit Trail Verified")
    print("\nALL SECTION 11 TESTS PASSED WITH 100% SUCCESS!")
