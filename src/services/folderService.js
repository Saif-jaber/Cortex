import { BASE_URL } from "./apiBase.js";

const API_URL = `${BASE_URL}/api/folders`;

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function createFolder(data) {
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create folder");
  return json;
}

export async function listFolders(data){
  const res = await fetch(`${API_URL}`,{
    method: "GET",
    headers: authHeaders(),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to load folders");
  return json;
}

export async function deleteFolder(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete folder");
  return json;
}