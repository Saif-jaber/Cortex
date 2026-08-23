// Base URL of the backend. In dev this stays empty so requests hit the
// Vite proxy (/api -> localhost:5000). In production set
// VITE_REACT_APP_BACKEND_BASEURL to the deployed backend origin.
const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";
export const BASE_URL = RAW_BASE.replace(/\/+$/, "");
