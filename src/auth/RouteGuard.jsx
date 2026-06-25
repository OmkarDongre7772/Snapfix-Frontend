import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// Role-to-home mapping — single source of truth
export const ROLE_HOME = {
  CITIZEN: "/citizen/home",
  WORKER:  "/worker/home",
  ADMIN:   "/admin/home",
};

/**
 * RouteGuard — protects routes that require authentication or a specific role.
 *
 * Usage:
 *   <RouteGuard />                 — any authenticated user
 *   <RouteGuard role="WORKER" />   — only WORKER role
 *   <RouteGuard role={["ADMIN","WORKER"]} /> — multiple roles
 */
export function RouteGuard({ allowedRoles, role }) {
  const { accessToken, user, isLoading } = useAuth();
  const location = useLocation();

  // While silent boot refresh is still in flight, don't redirect — just wait.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Spinner />
          <span className="text-sm text-text-muted">Loading…</span>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login, preserve intended destination
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  const roles = allowedRoles ?? role;
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user?.role)) {
      // Send them to their own home instead of a generic 403
      const home = ROLE_HOME[user?.role] ?? "/unauthorized";
      return <Navigate to={home} replace />;
    }
  }

  return <Outlet />;
}

function Spinner() {
  return (
    <svg
      className="w-8 h-8 text-accent animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
