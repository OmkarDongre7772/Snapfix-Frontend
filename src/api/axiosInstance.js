import axios from "axios";

// ── Shared mutable ref for access token (in-memory only) ───────────────────
// This module-level object acts as the bridge between AuthContext
// (which holds the canonical token) and the interceptor (which needs it
// without re-importing AuthContext to avoid circular deps).
export const tokenStore = {
  accessToken: null,            // set by AuthContext on login / refresh
  refreshToken: () => null,     // set by AuthContext — calls refresh + updates self
  logout: () => {},             // set by AuthContext — forces logout on double-401
};

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: inject Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 → silent refresh → retry once ─────────
let isRefreshing = false;
let waitingQueue = []; // requests that arrived while refresh was in progress

const processQueue = (error, token = null) => {
  waitingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  waitingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh completes
      return new Promise((resolve, reject) => {
        waitingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await tokenStore.refreshToken();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
