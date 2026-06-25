import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ROLE_HOME } from "../auth/RouteGuard";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      // Redirect to the page they were trying to reach, or to role home
      const destination = from && from !== "/login" ? from : ROLE_HOME[user.role] ?? "/";
      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? "Invalid email or password."
          : err.response?.data?.message ?? "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-16">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white text-base font-bold">
            SF
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text">Sign in to SnapFix</h1>
            <p className="mt-1 text-sm text-text-muted">Civic infrastructure, fixed faster.</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" id="login-form">

            <Input
              id="login-email"
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <div
                role="alert"
                className="rounded border border-danger-light bg-danger-light px-3 py-2 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              id="login-submit-btn"
              loading={loading}
              fullWidth
              className="mt-1"
            >
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link to="/register" id="go-to-register-link" className="font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
