import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Card from "../components/Card";

const MODULES = [
  { label: "Reports & Bids", desc: "Review user reports and approve worker bids.",   to: "/admin/reports",  emoji: "📋", live: true },
  { label: "Tasks",          desc: "Monitor active tasks and citizen verifications.", to: "/admin/tasks",    emoji: "✅", live: true },
  { label: "Payments",       desc: "Release funds for completed and verified tasks.", to: "/admin/payments", emoji: "💸", live: true },
];

export default function AdminHome() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-2">Admin Dashboard</p>
        <h2 className="text-3xl font-semibold text-text">Control Centre 🛠️</h2>
        <p className="mt-2 text-text-muted text-sm">
          Manage reports, approve bids, oversee task completion and payment releases.
        </p>
      </div>

      {/* Modules */}
      <div className="grid gap-3">
        {MODULES.map(({ label, desc, to, emoji, live, phase, note }) => (
          live ? (
            <Link key={label} to={to} className="no-underline block">
              <Card padding="md" className="flex items-center gap-4 group hover:border-accent/40 hover:shadow-md transition-all duration-150 cursor-pointer">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-xl select-none">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">{label}</p>
                    {note && <span className="text-xs text-text-subtle">{note}</span>}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-subtle group-hover:text-accent transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Card>
            </Link>
          ) : (
            <Card key={label} padding="md" className="flex items-center gap-4 opacity-55 cursor-default">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-xl select-none">{emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
              </div>
              <span className="text-xs font-medium text-text-subtle border border-border rounded px-2 py-0.5 flex-shrink-0">{phase}</span>
            </Card>
          )
        ))}
      </div>

      {/* Session info */}
      <Card padding="sm" className="mt-8 font-mono text-xs text-text-muted">
        <p className="font-semibold text-text mb-2 font-sans text-sm">Session info</p>
        <p>User ID: <span className="text-text">{user?.userId}</span></p>
        <p>Email:   <span className="text-text">{user?.email}</span></p>
        <p>Role:    <span className="text-accent font-semibold">{user?.role}</span></p>
      </Card>
    </main>
  );
}
