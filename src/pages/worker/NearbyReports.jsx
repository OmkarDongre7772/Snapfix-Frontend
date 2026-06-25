import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getWorkerNearbyReportsApi, updateWorkerLocationApi } from "../../api/workerApi";
import { useGeolocation } from "../../hooks/useGeolocation";
import ReportCard from "../../components/ReportCard";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Button from "../../components/Button";

export default function NearbyReports() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { fetch: fetchLocation } = useGeolocation();
  const hasProfile = user?.profile?.lat != null && user?.profile?.lng != null;
  const loadingRef = useRef(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    setLocationMessage("");

    try {
      const coords = await fetchLocation();
      await updateWorkerLocationApi(coords.lat, coords.lng);
      await refreshUser();
    } catch (err) {
      if (hasProfile) {
        setLocationMessage("Using your saved worker location because live location is unavailable.");
      } else {
        setError(err.message || "Allow location access to load nearby created reports.");
        setReports([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }
    }

    try {
      const { data } = await getWorkerNearbyReportsApi();
      setReports(data.filter((report) => report.status === "CREATED"));
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load nearby reports.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchLocation, hasProfile, refreshUser]);

  useEffect(() => {
    if (hasProfile) load();
    else setLoading(false);
  }, [hasProfile, load]);

  if (!hasProfile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in">
        <h2 className="mb-2 text-xl font-semibold text-text">Profile setup required</h2>
        <p className="mb-6 text-sm text-text-muted">Complete your worker profile with skills and location to see nearby created reports.</p>
        <Button id="go-to-setup-btn" onClick={() => navigate("/worker/setup")}>Complete profile</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Worker</p>
          <h2 className="text-2xl font-semibold text-text">Nearby Created Reports</h2>
          <p className="mt-0.5 text-xs text-text-muted">Your location is refreshed each time this feed opens.</p>
        </div>
        <Button id="refresh-reports-btn" variant="secondary" size="sm" onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {locationMessage && (
        <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          {locationMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={load} className="ml-1 underline">Retry</button>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState title="No created reports nearby" description="New citizen reports near your updated location will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} linkPrefix="/worker/reports" showSupport={false} />
          ))}
        </div>
      )}
    </main>
  );
}
