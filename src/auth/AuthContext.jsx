import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { loginApi, logoutApi, refreshApi, registerApi } from "../api/authApi";
import { getMeApi } from "../api/userApi";
import { tokenStore } from "../api/axiosInstance";

export const AuthContext = createContext(null);

const REFRESH_TOKEN_KEY = "snapfix_rt";

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);    // UserResponse from /user/me
  const [accessToken, setAccessToken] = useState(null);    // in-memory only
  const [isLoading, setIsLoading]     = useState(true);    // true while boot refresh runs

  // Keep tokenStore in sync so the Axios interceptor can always read the latest token
  // without importing AuthContext (avoids circular deps).
  const setToken = useCallback((token) => {
    setAccessToken(token);
    tokenStore.accessToken = token;
  }, []);

  // ── Internal: perform a silent refresh ─────────────────────────────────────
  const doRefresh = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) throw new Error("No refresh token stored");

    const { data } = await refreshApi(stored);
    // Rotate: save new refresh token, update access token in memory
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setToken(data.accessToken);
    return data.accessToken;
  }, [setToken]);

  // ── Boot: silent refresh on every page load ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await doRefresh();
        const { data: me } = await getMeApi();
        if (!cancelled) setUser(me);
      } catch {
        // Treat any failure as logged-out (clear stale data)
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        if (!cancelled) { setToken(null); setUser(null); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []); // run once on mount

  // ── Wire tokenStore callbacks so the Axios interceptor can trigger refresh/logout ──
  useEffect(() => {
    tokenStore.refreshToken = doRefresh;
    tokenStore.logout = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    };
  }, [doRefresh, setToken]);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setToken(data.accessToken);
    const { data: me } = await getMeApi();
    setUser(me);
    return me; // caller uses me.role for redirect
  }, [setToken]);

  // ── register ───────────────────────────────────────────────────────────────
  // Registers and then auto-logs-in so caller can redirect immediately.
  const register = useCallback(async (name, email, password, role) => {
    await registerApi(name, email, password, role);
    return login(email, password);
  }, [login]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (stored) await logoutApi(stored); // invalidate server-side
    } catch { /* ignore — clean up client side regardless */ }
    setToken(null);
    setUser(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, [setToken]);

  // ── refresh user ───────────────────────────────────────────────────────────
  // Called after worker setup or profile update to refetch /user/me
  const refreshUser = useCallback(async () => {
    try {
      const { data: me } = await getMeApi();
      setUser(me);
      return me;
    } catch {
      // ignore
    }
  }, []);

  const value = { user, accessToken, isLoading, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
