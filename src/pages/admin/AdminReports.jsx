import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminReportsApi } from "../../api/adminApi";
import StatusBadge from "../../components/StatusBadge";
import CategoryBadge from "../../components/CategoryBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Button from "../../components/Button";
import Card from "../../components/Card";

const STATUS_TABS = [
  { value: null,          label: "All" },
  { value: "CREATED",     label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
];

const PAGE_SIZE = 15;

export default function AdminReports() {
  const navigate = useNavigate();

  const [reports,      setReports]      = useState([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(0);
  const [activeStatus, setActiveStatus] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const load = useCallback(async (status, pg) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getAdminReportsApi(status, pg, PAGE_SIZE);
      // Spring Page<T> shape: { content, totalPages, totalElements, number, size }
      setReports(data.content ?? data);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load reports.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(activeStatus, page); }, [activeStatus, page, load]);

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setPage(0);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <p className="section-label mb-1">Admin</p>
        <h2 className="text-2xl font-semibold text-text">Reports</h2>
        <p className="text-sm text-text-muted mt-1">Review and manage all civic reports across the platform.</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1" role="tablist">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeStatus === value}
            onClick={() => handleTabChange(value)}
            className={[
              "px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-ring",
              activeStatus === value
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text hover:bg-[var(--color-muted-bg)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={() => load(activeStatus, page)} className="underline ml-1">Retry</button>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon="📋" title="No reports" description="No reports found for this filter." />
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {reports.map((report) => (
              <Card
                key={report.id}
                padding="md"
                className="flex gap-4 cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-150 group"
                onClick={() => navigate(`/admin/reports/${report.id}`)}
              >
                {/* Thumbnail */}
                {report.imageUrl ? (
                  <img src={report.imageUrl} alt="" className="h-14 w-14 flex-shrink-0 rounded object-cover border border-border" />
                ) : (
                  <div className="h-14 w-14 flex-shrink-0 rounded bg-[var(--color-muted-bg)] flex items-center justify-center text-xl">📍</div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <CategoryBadge category={report.category} size="sm" />
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-sm font-medium text-text line-clamp-2 group-hover:text-accent transition-colors">
                    {report.description}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{formatDate(report.createdAt)}</p>
                </div>

                <div className="flex items-center text-text-subtle group-hover:text-accent flex-shrink-0 self-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary" size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                id="prev-page-btn"
              >← Prev</Button>
              <span className="text-sm text-text-muted">Page {page + 1} of {totalPages}</span>
              <Button
                variant="secondary" size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                id="next-page-btn"
              >Next →</Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
