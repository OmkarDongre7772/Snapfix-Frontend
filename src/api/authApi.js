import api from "./axiosInstance";

// POST /auth/login  → { accessToken, refreshToken }
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password });

// POST /auth/register  → plain string "User registered successfully"
// role must be "CITIZEN" | "WORKER" | "ADMIN"
export const registerApi = (name, email, password, role) =>
  api.post("/auth/register", { name, email, password, role });

// POST /auth/refresh  → { accessToken, refreshToken }
// ⚠ Backend expects a raw text/plain string body, NOT JSON
export const refreshApi = (refreshToken) =>
  api.post("/auth/refresh", refreshToken, {
    headers: { "Content-Type": "text/plain" },
  });

// POST /auth/logout  → plain string "Logged out successfully"
// Requires Authorization header (handled by interceptor) + { refreshToken } body
export const logoutApi = (refreshToken) =>
  api.post("/auth/logout", { refreshToken });
