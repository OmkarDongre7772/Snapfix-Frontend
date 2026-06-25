import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useThemeContext } from "../contexts/ThemeContext";

// Nav links per role
const NAV_LINKS = {
  CITIZEN: [
    { to: "/citizen/home",          label: "Home" },
    { to: "/citizen/reports",       label: "Nearby Feed" },
    { to: "/citizen/reports/me",    label: "My Reports" },
    { to: "/citizen/notifications", label: "Notifications" },
  ],
  WORKER: [
    { to: "/worker/home",    label: "Home" },
    { to: "/worker/reports", label: "Nearby Reports" },
    { to: "/worker/bids",    label: "My Bids" },
    { to: "/worker/tasks",   label: "My Tasks" },
    { to: "/worker/wallet",  label: "Wallet" },
  ],
  ADMIN: [
    { to: "/admin/home",     label: "Home" },
    { to: "/admin/reports",  label: "Reports" },
    { to: "/admin/tasks",    label: "Tasks" },
    { to: "/admin/payments", label: "Payments" },
  ],
};

const ROLE_BADGE = {
  CITIZEN: { label: "Citizen", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  WORKER:  { label: "Worker",  cls: "bg-warning-light text-warning dark:bg-warning/10 dark:text-warning" },
  ADMIN:   { label: "Admin",   cls: "bg-accent-light text-accent dark:bg-accent/10 dark:text-accent" },
};

// ── Sun icon ────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

// ── Moon icon ───────────────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useThemeContext();

  if (!user) return null;

  const links = NAV_LINKS[user.role] ?? [];
  const badge = ROLE_BADGE[user.role];
  const name  = user.profile?.name ?? user.email;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <NavLink
            to={`/${user.role.toLowerCase()}/home`}
            className="flex items-center gap-2 group no-underline"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-accent text-white text-xs font-bold select-none">
              SF
            </div>
            <span className="font-semibold text-text text-sm tracking-tight group-hover:text-accent transition-colors">
              SnapFix
            </span>
          </NavLink>

          {/* ── Main nav links (desktop) ──────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 px-4" aria-label="Main navigation">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 no-underline whitespace-nowrap",
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-muted hover:text-text hover:bg-[var(--color-muted-bg)]",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side controls ───────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Role badge */}
            {badge && (
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badge.cls}`}>
                {badge.label}
              </span>
            )}

            {/* User name */}
            <span className="hidden sm:block text-sm text-text-muted truncate max-w-[130px]">
              {name}
            </span>

            {/* ── Theme toggle ─────────────────────────────────────── */}
            <button
              onClick={toggle}
              id="theme-toggle-btn"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-8 h-8 rounded border border-border text-text-muted
                         hover:text-text hover:bg-[var(--color-muted-bg)] transition-colors duration-150 focus-ring"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              id="nav-logout-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm
                         text-text-muted hover:text-danger hover:border-danger transition-colors duration-150 focus-ring"
              aria-label="Log out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
