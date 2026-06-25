import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReportsApi } from "../../api/reportApi";
import ReportCard from "../../components/ReportCard";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Button from "../../components/Button";

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: "CREATED", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function CitizenMyReports() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getMyReportsApi();
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  useEffect(() => {
    setFiltered(activeTab ? reports.filter((report) => report.status === activeTab) : reports);
  }, [activeTab, reports]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Citizen</p>
          <h2 className="text-2xl font-semibold text-text">My Reports</h2>
          <p className="mt-1 text-xs text-text-muted">Track your reports, submitted proof, verification, and rating.</p>
        </div>
        <Link to="/citizen/reports/new">
          <Button id="new-report-btn" size="sm">+ New report</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto pb-1" role="tablist">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={[
              "rounded px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-ring",
              activeTab === value
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text hover:bg-[var(--color-muted-bg)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={loadReports} className="ml-1 underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="[]"
          title={activeTab ? "No reports with this status" : "No reports yet"}
          description="After you submit a report, it will appear here with its repair progress."
          action={<Link to="/citizen/reports/new"><Button size="sm">Report an issue</Button></Link>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} linkPrefix="/citizen/reports" />
          ))}
        </div>
      )}
    </main>
  );
}
