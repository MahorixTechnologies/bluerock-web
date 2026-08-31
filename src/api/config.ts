const _API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
export const API_URL = _API_BASE ? `${_API_BASE}/api/v1` : "";
