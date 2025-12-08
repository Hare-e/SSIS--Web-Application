// src/utils/auth.js

// Always talk directly to the Flask backend
const API_BASE = "http://127.0.0.1:5000";

export async function fetchWithAuth(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: "include", // send cookies (JWT)
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  return res;
}

export async function getCurrentUser() {
  // calls /api/auth/me which requires a valid access cookie
  const res = await fetchWithAuth("/api/auth/me", { method: "GET" });

  if (res.ok) {
    // backend returns { username, role } :contentReference[oaicite:0]{index=0}
    return await res.json();
  } else if (res.status === 401) {
    // try refresh
    const refresh = await fetchWithAuth("/api/auth/refresh", {
      method: "POST",
    });

    if (refresh.ok) {
      // retry /me
      const r2 = await fetchWithAuth("/api/auth/me", { method: "GET" });
      if (r2.ok) return await r2.json();
    }
    return null;
  } else {
    return null;
  }
}
