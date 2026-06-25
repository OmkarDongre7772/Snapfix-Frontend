import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import CategoryBadge from "./CategoryBadge";

/**
 * ReportCard — compact display of a single report.
 *
 * @param {object}  report     — ReportResponse from backend
 * @param {string}  linkPrefix — e.g. "/citizen/reports" or "/worker/reports"
 * @param {boolean} showSupport
 */
export default function ReportCard({ report, linkPrefix = "/citizen/reports", showSupport = true }) {
  const navigate = useNavigate();

  const ago = timeAgo(report.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`${linkPrefix}/${report.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`${linkPrefix}/${report.id}`)}
      className="group card-base p-4 flex gap-4 cursor-pointer hover:border-accent/40 hover:shadow-md
                 transition-all duration-150 animate-fade-in"
    >
      {/* Image thumbnail */}
      {report.imageUrl ? (
        <img
          src={report.imageUrl}
          alt={report.description}
          className="h-16 w-16 flex-shrink-0 rounded-md object-cover border border-border"
        />
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-[var(--color-muted-bg)] flex items-center justify-center text-2xl select-none">
          📍
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <CategoryBadge category={report.category} size="sm" />
          <StatusBadge status={report.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-text font-medium line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {report.description}
        </p>

        {/* Footer row */}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-text-muted">
          <span>{ago}</span>
          {showSupport && (
            <span className="flex items-center gap-1">
              <span aria-hidden="true">👍</span>
              {report.supportCount ?? 0} support
            </span>
          )}
          {report.lat && (
            <span className="hidden sm:inline truncate">
              {Number(report.lat).toFixed(4)}, {Number(report.lng).toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0 flex items-center self-center text-text-subtle group-hover:text-accent transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
