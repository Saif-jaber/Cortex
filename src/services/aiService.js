import { BASE_URL } from "./apiBase.js";

const API_URL = `${BASE_URL}/api/ai`;

function authHeaders() {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function jsonHeaders() {
  return { ...authHeaders(), "Content-Type": "application/json" };
}

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export async function getAiProviders() {
  const res = await fetch(`${API_URL}/providers`, { headers: authHeaders() });
  return parseJson(res);
}

export async function getAiConfig() {
  const res = await fetch(`${API_URL}/config`, { headers: authHeaders() });
  return parseJson(res);
}

// The backend verifies the credentials against the live provider before
// saving, so an invalid key or unreachable local server is rejected here.
export async function saveAiConfig({ provider, apiKey, baseUrl, model }) {
  const res = await fetch(`${API_URL}/config`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ provider, apiKey, baseUrl, model }),
  });
  return parseJson(res);
}

export async function deleteAiConfig() {
  const res = await fetch(`${API_URL}/config`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJson(res);
}
