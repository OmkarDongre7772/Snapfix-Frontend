import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Card from "../components/Card";
import Button from "../components/Button";

const QUICK_ACTIONS = [
  { label: "Nearby Reports",  desc: "Discover reports within your area and place bids.", to: "/worker/reports", emoji: "📡", live: true },
  { label: "My Active Bids",  desc: "View bids you've placed and their current status.", to: "/worker/bids",    emoji: "🤝", live: true },
  { label: "My Tasks",        desc: "See assigned tasks and update their progress.",     to: "/worker/tasks",   emoji: "✅", live: true },
  { label: "Wallet",          desc: "Track earnings and payment releases.",              to: "/worker/wallet",  emoji: "💰", live: true },
];

export default function WorkerHome() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const profile    = user?.profile;
  const name       = profile?.name ?? user?.email ?? "Worker";
  const needsSetup = !profile?.lat;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-2">Worker Dashboard</p>
        <h2 className="text-3xl font-semibold text-text">Welcome back, {name} 🔧</h2>
        <p className="mt-2 text-text-muted text-sm">Ready to tackle some civic fixes today?</p>
      </div>

      {/* Setup prompt */}
      {needsSetup && (
        <div className="mb-8 flex items-start gap-3 rounded-lg border border-warning bg-warning-light px-4 py-3">
          <span className="text-warning mt-0.5 text-lg leading-none">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">Profile setup required</p>
            <p className="text-xs text-warning/80 mt-0.5">Add your skills and location to start discovering nearby jobs.</p>
          </div>
          <Button size="sm" onClick={() => navigate("/worker/setup")} id="worker-home-setup-btn">
            Set up
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Rating",          value: profile?.rating ? `${profile.rating.toFixed(1)}★` : "—" },
          { label: "Tasks Completed", value: profile?.completedTasks ?? "—" },
          { label: "Wallet Balance",  value: profile?.wallet?.balance ? `₹${profile.wallet.balance}` : "—" },
        ].map(({ label, value }) => (
          <Card key={label} padding="sm" className="text-center">
            <p className="text-xl font-semibold text-text">{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3">
        {QUICK_ACTIONS.map(({ label, desc, to, emoji, live, phase }) => (
          live ? (
            <Link key={label} to={to} className="no-underline block">
              <Card padding="md" className="flex items-center gap-4 group hover:border-accent/40 hover:shadow-md transition-all duration-150 cursor-pointer">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-warning-light text-xl select-none">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">{label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-subtle group-hover:text-accent transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Card>
            </Link>
          ) : (
            <Card key={label} padding="md" className="flex items-center gap-4 opacity-60 cursor-default">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-warning-light text-xl select-none">{emoji}</div>
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
        <p>User ID:    <span className="text-text">{user?.userId}</span></p>
        <p>Email:      <span className="text-text">{user?.email}</span></p>
        <p>Role:       <span className="text-warning font-semibold">{user?.role}</span></p>
        <p>Available:  <span className="text-text">{profile?.available?.toString() ?? "—"}</span></p>
      </Card>
    </main>
  );
}
