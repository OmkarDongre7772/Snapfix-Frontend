import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ROLE_HOME } from "../auth/RouteGuard";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

const ROLES = [
  {
    value: "CITIZEN",
    label: "Citizen",
    icon: "🏠",
    desc: "Report civic issues in your area",
  },
  {
    value: "WORKER",
    label: "Worker",
    icon: "🔧",
    desc: "Discover and fix reported issues",
  },
];

function validate(form) {
  const errors = {};
  if (!form.name.trim())        errors.name     = "Name is required.";
  if (!form.email.trim())       errors.email    = "Email is required.";
  if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (form.password !== form.confirm)
                                errors.confirm  = "Passwords do not match.";
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [role, setRole]     = useState("CITIZEN");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, role);
      if (user.role === "WORKER") {
        navigate("/worker/setup", { replace: true });
      } else {
        navigate(ROLE_HOME[user.role] ?? "/", { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.status === 409
          ? "An account with this email already exists."
          : err.response?.data?.message ?? "Registration failed. Please try again.";
      setApiError(msg);
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
            <h1 className="text-2xl font-semibold text-text">Create your account</h1>
            <p className="mt-1 text-sm text-text-muted">Join the SnapFix community.</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" id="register-form">

            {/* Role toggle */}
            <div>
              <p className="field-label mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
                {ROLES.map(({ value, label, icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-btn-${value.toLowerCase()}`}
                    role="radio"
                    aria-checked={role === value}
                    onClick={() => setRole(value)}
                    className={[
                      "flex flex-col items-start gap-1 rounded border p-3 text-left transition-all duration-150 focus-ring",
                      role === value
                        ? "border-accent bg-accent-light ring-1 ring-accent"
                        : "border-border hover:border-gray-400 bg-surface",
                    ].join(" ")}
                  >
                    <span className="text-lg leading-none">{icon}</span>
                    <span className="text-sm font-semibold text-text">{label}</span>
                    <span className="text-xs text-text-muted leading-snug">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divider my-0" />

            <Input
              id="register-name"
              label="Full name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              id="register-email"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              id="register-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              id="register-confirm"
              label="Confirm password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
            />

            {apiError && (
              <div role="alert" className="rounded border border-danger-light bg-danger-light px-3 py-2 text-sm text-danger">
                {apiError}
              </div>
            )}

            <Button type="submit" id="register-submit-btn" loading={loading} fullWidth className="mt-1">
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link to="/login" id="go-to-login-link" className="font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
