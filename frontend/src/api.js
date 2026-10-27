const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    throw new Error(err.detail || 'Registration failed');
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
    throw new Error(err.detail || 'Invalid email or password');
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

// Admin CRM APIs (To view all customers & contact submissions)
export async function fetchAdminCustomers(tier = null) {
  const url = tier ? `${BASE_URL}/admin/customers?tier=${tier}` : `${BASE_URL}/admin/customers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load customer database');
  return res.json();
}

export async function fetchAdminLeads() {
  const res = await fetch(`${BASE_URL}/admin/leads`);
  if (!res.ok) throw new Error('Failed to load leads database');
  return res.json();
}

export async function updateAdminLead(leadId, status) {
  const res = await fetch(`${BASE_URL}/admin/leads/${leadId}?status=${status}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update lead status');
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

export async function fetchRules() {
  const res = await fetch(`${BASE_URL}/rules`);
  return res.json();
}

export async function fetchTerms() {
  const res = await fetch(`${BASE_URL}/terms`);
  return res.json();
}

export async function fetchFacts() {
  const res = await fetch(`${BASE_URL}/facts`);
  return res.json();
}

export async function fetchAssets() {
  const res = await fetch(`${BASE_URL}/assets`);
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
  const res = await fetch(`${BASE_URL}/sources/import`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to import document');
  return res.json();
}
