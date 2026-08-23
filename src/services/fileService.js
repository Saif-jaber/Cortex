import { BASE_URL } from "./apiBase.js";

const API_URL = `${BASE_URL}/api/files`;

function authHeaders() {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseResponse(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export async function getUploadUrl(data) {
  const res = await fetch(`${API_URL}/upload-url`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function uploadToR2(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
}

export async function confirmUpload(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res);
}

export async function listFiles() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return parseResponse(res);
}

export async function getStorageStats() {
  const res = await fetch(`${API_URL}/storage`, { headers: authHeaders() });
  return parseResponse(res);
}

export async function getDownloadUrl(id) {
  const res = await fetch(`${API_URL}/${id}/download`, { headers: authHeaders() });
  return parseResponse(res);
}

export async function deleteFile(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseResponse(res);
}
