const BASE_URL = 'http://localhost:5000/api';

export const api = {
  getOrgs: () => fetch(`${BASE_URL}/organizations`).then(res => res.json()),
  getComponents: () => fetch(`${BASE_URL}/components`).then(res => res.json()),
  getWorkflows: (orgId) => fetch(`${BASE_URL}/workflows?org_id=${orgId}`).then(res => res.json()),
  createWorkflow: (data) => fetch(`${BASE_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  getApps: (orgId) => fetch(`${BASE_URL}/applications?org_id=${orgId}`).then(res => res.json()),
  getAppDetails: (id) => fetch(`${BASE_URL}/applications/${id}`).then(res => res.json()),
  createApp: (orgId, workflowId) => fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ org_id: orgId, workflow_id: workflowId })
  }).then(res => res.json()),
  advanceApp: (id) => fetch(`${BASE_URL}/applications/${id}/advance`, {
    method: 'POST'
  }).then(res => res.json()),
};
