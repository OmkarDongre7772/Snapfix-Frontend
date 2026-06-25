import { useNotifications } from "../../hooks/useNotifications";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";

const TYPE_ICON = {
  REPORT_CREATED:  "📍",
  BID_APPROVED:    "✅",
  REPORT_SUPPORTED:"👍",
  PAYMENT_RELEASED:"💰",
};

export default function CitizenNotifications() {
  const { notifications, loading, error, markRead, markAllRead, reload } = useNotifications();

  const unread = notifications.filter((n) => !n.read);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Inbox</p>
          <h2 className="text-2xl font-semibold text-text">
            Notifications
            {unread.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold">
                {unread.length}
              </span>
            )}
          </h2>
        </div>
        {unread.length > 0 && (
          <Button
            id="mark-all-read-btn"
            variant="ghost"
            size="sm"
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={reload} className="underline ml-1">Retry</button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="All clear" description="No notifications yet." />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem key={n.notificationId} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </main>
  );
}

function NotificationItem({ notification: n, onMarkRead }) {
  const icon = TYPE_ICON[n.type] ?? "🔔";

  return (
    <div
      className={[
        "card-base p-4 flex gap-3 transition-all duration-150",
        !n.read ? "border-accent/30 bg-accent-light" : "opacity-75",
      ].join(" ")}
    >
      <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text leading-snug">{n.message}</p>
        <p className="text-xs text-text-muted mt-1">{formatDate(n.createdAt)}</p>
      </div>
      {!n.read && (
        <button
          onClick={() => onMarkRead(n.notificationId)}
          id={`mark-read-${n.notificationId}`}
          className="flex-shrink-0 text-xs text-accent hover:underline focus-ring rounded"
          aria-label="Mark as read"
        >
          Mark read
        </button>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(d);
}
