export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('sentinel_api_url');
    if (custom) return custom.replace(/\/$/, '');
  }
  return (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
}

export function setApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      let clean = url.trim().replace(/\/$/, '');
      if (!clean.endsWith('/api') && !clean.includes('/api/')) {
        clean = `${clean}/api`;
      }
      localStorage.setItem('sentinel_api_url', clean);
      return clean;
    } else {
      localStorage.removeItem('sentinel_api_url');
      return null;
    }
  }
}

// Dynamic BASE_URL object that resolves at runtime
const BASE_URL = {
  toString() { return getApiBaseUrl(); },
  valueOf() { return getApiBaseUrl(); },
  [Symbol.toPrimitive]() { return getApiBaseUrl(); }
};

// Auth Token Storage Helper
export function getStoredToken() {
  return localStorage.getItem('sentinel_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('sentinel_token', token);
  } else {
    localStorage.removeItem('sentinel_token');
  }
}

export function getStoredUser() {
  const u = localStorage.getItem('sentinel_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('sentinel_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sentinel_user');
  }
}

// Authentication APIs
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail || (res.status === 404
      ? `Backend not reached (404 at ${BASE_URL}/auth/register). Set VITE_API_URL in Vercel to your deployed backend URL (e.g. https://your-backend.onrender.com/api) and Redeploy.`
      : `Registration failed with status ${res.status}`);
    throw new Error(detail);
  }
  const result = await res.json();
  if (result.token) {
    setStoredToken(result.token);
    setStoredUser(result.user);
  }
  return result;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail || (res.status === 404
      ? `Backend not reached (404 at ${BASE_URL}/auth/login). Set VITE_API_URL in Vercel to your deployed backend URL and Redeploy.`
      : `Invalid email or password`);
    throw new Error(detail);
  }
  const result = await res.json();
  if (result.token) {
    setStoredToken(result.token);
    setStoredUser(result.user);
  }
  return result;
}

export async function googleSignIn(data) {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail || (res.status === 404
      ? `Backend not reached (404 at ${BASE_URL}/auth/google). Please verify VITE_API_URL on Vercel points to your live backend (e.g. https://your-backend.onrender.com/api).`
      : `Google authentication failed (status ${res.status})`);
    throw new Error(detail);
  }
  const result = await res.json();
  if (result.token) {
    setStoredToken(result.token);
    setStoredUser(result.user);
  }
  return result;
}

export async function fetchMe() {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    setStoredToken(null);
    setStoredUser(null);
    return null;
  }
  const user = await res.json();
  setStoredUser(user);
  return user;
}

export function logoutUser() {
  setStoredToken(null);
  setStoredUser(null);
}

// Subscription APIs
export async function upgradeSubscription(tier, billingPeriod = 'monthly') {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/subscriptions/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ tier, billing_period: billingPeriod })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update subscription');
  }
  const result = await res.json();
  // Refresh me
  await fetchMe();
  return result;
}

// Admin CRM APIs (To view all customers & contact submissions - Developer only)
export async function fetchAdminCustomers(tier = null) {
  const token = getStoredToken();
  const url = tier ? `${BASE_URL}/admin/customers?tier=${tier}` : `${BASE_URL}/admin/customers`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load customer database');
  }
  return res.json();
}

export async function fetchAdminLeads() {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/admin/leads`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load leads database');
  }
  return res.json();
}

export async function updateAdminLead(leadId, status) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/admin/leads/${leadId}?status=${status}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update lead status');
  }
  return res.json();
}

export async function fetchWhitelist() {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/admin/whitelist`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load access whitelist');
  }
  return res.json();
}

export async function grantCustomerAccess(email, notes = 'Granted by developer') {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/admin/grant-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ email, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to grant customer access');
  }
  return res.json();
}

export async function revokeCustomerAccess(email) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/admin/revoke-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to revoke customer access');
  }
  return res.json();
}

export async function subscribeNewsletter(email) {
  const res = await fetch(`${BASE_URL}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
}

// Workspace & Review APIs
export async function fetchWorkspace() {
  const res = await fetch(`${BASE_URL}/workspaces/demo`);
  if (!res.ok) throw new Error('Failed to load demo workspace');
  return res.json();
}

export async function resetDemo() {
  const res = await fetch(`${BASE_URL}/workspaces/demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function fetchSamples() {
  const res = await fetch(`${BASE_URL}/samples`);
  if (!res.ok) throw new Error('Failed to load sample posts');
  return res.json();
}

export async function submitReview(data) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit content for review');
  return res.json();
}

export async function getReview(id) {
  const res = await fetch(`${BASE_URL}/reviews/${id}`);
  if (!res.ok) throw new Error('Failed to fetch review');
  return res.json();
}

export async function patchFinding(id, status, userEdit = null, comment = null) {
  const res = await fetch(`${BASE_URL}/findings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, user_edit: userEdit, comment })
  });
  if (!res.ok) throw new Error('Failed to update finding status');
  return res.json();
}

export async function submitForApproval(reviewId) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/submit`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to submit review for approval');
  return res.json();
}

export async function recordDecision(reviewId, role, outcome, reason = '') {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewer_role: role, outcome, reason })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to record review decision');
  }
  return res.json();
}

export async function fetchQueue() {
  const res = await fetch(`${BASE_URL}/reviews/queue/list`);
  if (!res.ok) throw new Error('Failed to load review queue');
  return res.json();
}

export async function fetchHistory(reviewId) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/history`);
  if (!res.ok) throw new Error('Failed to load review history');
  return res.json();
}

export async function fetchRules(workspaceId = null) {
  const token = getStoredToken();
  const url = workspaceId ? `${BASE_URL}/rules?workspace_id=${workspaceId}` : `${BASE_URL}/rules`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load rules');
  return res.json();
}

export async function createRule(data) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create rule');
  }
  return res.json();
}

export async function deleteRule(id) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/rules/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to delete rule');
  return res.json();
}

export async function fetchTerms(workspaceId = null) {
  const token = getStoredToken();
  const url = workspaceId ? `${BASE_URL}/terms?workspace_id=${workspaceId}` : `${BASE_URL}/terms`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load terminology');
  return res.json();
}

export async function createTerm(data) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/terms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create term');
  }
  return res.json();
}

export async function deleteTerm(id) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/terms/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to delete term');
  return res.json();
}

export async function fetchFacts(workspaceId = null) {
  const token = getStoredToken();
  const url = workspaceId ? `${BASE_URL}/facts?workspace_id=${workspaceId}` : `${BASE_URL}/facts`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load facts');
  return res.json();
}

export async function createFact(data) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/facts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create fact');
  }
  return res.json();
}

export async function deleteFact(id) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/facts/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to delete fact');
  return res.json();
}

export async function fetchAssets(workspaceId = null) {
  const token = getStoredToken();
  const url = workspaceId ? `${BASE_URL}/assets?workspace_id=${workspaceId}` : `${BASE_URL}/assets`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load assets');
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${BASE_URL}/insights`);
  if (!res.ok) throw new Error('Failed to load insights');
  return res.json();
}

export async function verifyAuditChain() {
  const res = await fetch(`${BASE_URL}/audit/verify`);
  if (!res.ok) throw new Error('Failed to verify cryptographic audit trail');
  return res.json();
}

export async function importSourceFile(formData) {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}/sources/import`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to import document');
  }
  return res.json();
}
