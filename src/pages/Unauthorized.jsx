import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ROLE_HOME } from "../auth/RouteGuard";
import Button from "../components/Button";

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const home = user ? ROLE_HOME[user.role] ?? "/" : "/login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-sm w-full text-center animate-slide-up">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-light text-3xl">
          🚫
        </div>

        <h1 className="text-2xl font-semibold text-text mb-2">Access Denied</h1>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          You don't have permission to view this page.
          {user && (
            <> Your role (<strong className="text-text">{user.role}</strong>) doesn't have access here.</>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            id="back-to-home-btn"
            onClick={() => navigate(home, { replace: true })}
            fullWidth
          >
            Go to my home
          </Button>
          {!user && (
            <Button
              id="go-to-login-btn"
              variant="secondary"
              fullWidth
              onClick={() => navigate("/login", { replace: true })}
            >
              Sign in
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
