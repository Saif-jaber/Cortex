const API_URL = "/api/chat";

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

export async function listChats() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return parseJson(res);
}

export async function getChat(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
  return parseJson(res);
}

export async function createChat(title) {
  const res = await fetch(`${API_URL}/new`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ title }),
  });
  return parseJson(res);
}

export async function deleteChat(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJson(res);
}

export async function askAI(question, { chatId, onStatus, onDelta, onSources, onChatId, onError } = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ question, chatId }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Request failed");
  }
  if (!res.body) throw new Error("No response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      try {
        const payload = JSON.parse(dataLine.slice(6));
        if (payload.type === "status" && onStatus) onStatus(payload.message);
        else if (payload.type === "delta" && onDelta) onDelta(payload.text);
        else if (payload.type === "sources" && onSources) onSources(payload.sources || []);
        else if (payload.type === "chatId" && onChatId) onChatId(payload.chatId);
        else if (payload.type === "error" && onError) onError(payload.message);
      } catch {
        // ignore malformed events
      }
    }
  }
}
