import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import Card from "../components/Card";
import Button from "../components/Button";

const QUICK_ACTIONS = [
  { label: "Report an issue", desc: "Submit a new civic report with photos and location.", to: "/citizen/reports/new", icon: "+" },
  { label: "Nearby Feed", desc: "See civic reports near your current location.", to: "/citizen/reports", icon: "N" },
  { label: "My Reports", desc: "Track your submitted reports and verification tasks.", to: "/citizen/reports/me", icon: "M" },
  { label: "Notifications", desc: "See updates on your reports and verifications.", to: "/citizen/notifications", icon: "!" },
];

export default function CitizenHome() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const name = user?.profile?.name ?? user?.email ?? "there";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      <div className="mb-8">
        <p className="section-label mb-2">Citizen Dashboard</p>
        <h2 className="text-3xl font-semibold text-text">Hey, {name}</h2>
        <p className="mt-2 text-sm text-text-muted">
          You have submitted <strong className="text-text">{user?.profile?.reportsSubmitted ?? 0}</strong> report{user?.profile?.reportsSubmitted !== 1 ? "s" : ""} so far.
        </p>
      </div>

      <div className="grid gap-3">
        {QUICK_ACTIONS.map(({ label, desc, to, icon }) => (
          <Link key={label} to={to} className="block no-underline">
            <Card padding="md" className="group flex cursor-pointer items-center gap-4 transition-all duration-150 hover:border-accent/40 hover:shadow-md">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-semibold text-accent select-none">
                {icon}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text transition-colors group-hover:text-accent">{label}</p>
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{unreadCount}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-text-muted">{desc}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-text-subtle transition-colors group-hover:text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/citizen/reports/new">
          <Button fullWidth size="lg" id="citizen-home-report-btn">Report a civic issue</Button>
        </Link>
      </div>

      <Card padding="sm" className="mt-8 font-mono text-xs text-text-muted">
        <p className="mb-2 font-sans text-sm font-semibold text-text">Session info</p>
        <p>User ID: <span className="text-text">{user?.userId}</span></p>
        <p>Email: <span className="text-text">{user?.email}</span></p>
        <p>Role: <span className="font-semibold text-accent">{user?.role}</span></p>
      </Card>
    </main>
  );
}
