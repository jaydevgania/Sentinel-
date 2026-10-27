const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
