import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getWorkerNearbyReportsApi } from "../../api/workerApi";
import ReportCard from "../../components/ReportCard";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Button from "../../components/Button";

const STATUS_TABS = [
  { value: null,      label: "All" },
  { value: "CREATED", label: "Open" },
];

export default function NearbyReports() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const hasProfile = user?.profile?.lat != null;

  const [reports,  setReports]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [active,   setActive]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getWorkerNearbyReportsApi();
      setReports(data);
      setFiltered(data);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load nearby reports.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (hasProfile) load();
    else setLoading(false);
  }, [hasProfile, load]);

  useEffect(() => {
    setFiltered(active ? reports.filter((r) => r.status === active) : reports);
  }, [active, reports]);

  if (!hasProfile) return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in">
      <div className="text-4xl mb-4">🗺️</div>
      <h2 className="text-xl font-semibold text-text mb-2">Profile setup required</h2>
      <p className="text-sm text-text-muted mb-6">Complete your worker profile with skills and location to see nearby reports.</p>
      <Button id="go-to-setup-btn" onClick={() => navigate("/worker/setup")}>Complete profile</Button>
    </main>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Worker</p>
          <h2 className="text-2xl font-semibold text-text">Nearby Reports</h2>
          <p className="text-xs text-text-muted mt-0.5">Based on your saved location</p>
        </div>
        <Button id="refresh-reports-btn" variant="secondary" size="sm" onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4" role="tablist">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={label}
            role="tab"
            aria-selected={active === value}
            onClick={() => setActive(value)}
            className={[
              "px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 focus-ring",
              active === value
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
          {error} <button onClick={load} className="underline ml-1">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🗺️" title="No reports nearby" description="No civic issues have been reported near your location yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} linkPrefix="/worker/reports" showSupport={false} />
          ))}
        </div>
      )}
    </main>
  );
}
