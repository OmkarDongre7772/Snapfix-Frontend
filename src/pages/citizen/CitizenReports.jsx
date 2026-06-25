import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getNearbyReportsApi } from "../../api/reportApi";
import { updateProfileApi } from "../../api/userApi";
import { useGeolocation } from "../../hooks/useGeolocation";
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

const DEFAULT_RADIUS = 50000;

export default function CitizenReports() {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile;
  const { fetch: fetchLocation, lat: liveLat } = useGeolocation();

  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const loadingRef = useRef(false);
  const lastLoadedCoordsRef = useRef(null);

  const loadReports = useCallback(async (lat, lng) => {
    const { data } = await getNearbyReportsApi(lat, lng, DEFAULT_RADIUS);
    setReports(data);
  }, []);

  const syncLocationAndLoad = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setLocationMessage("");

    const savedLat = profile?.location?.latitude;
    const savedLng = profile?.location?.longitude;
    let coords = null;

    try {
      coords = await fetchLocation();
      const changed =
        !savedLat ||
        !savedLng ||
        Math.abs(Number(savedLat) - coords.lat) > 0.0001 ||
        Math.abs(Number(savedLng) - coords.lng) > 0.0001;

      if (changed) {
        await updateProfileApi({
          name: profile?.name ?? user?.email ?? "Citizen",
          latitude: coords.lat,
          longitude: coords.lng,
        });
        await refreshUser();
      }
    } catch (locationError) {
      if (savedLat && savedLng) {
        coords = { lat: Number(savedLat), lng: Number(savedLng) };
        setLocationMessage("Using your saved profile location because live location is unavailable.");
      } else {
        setReports([]);
        setFiltered([]);
        setError(locationError.message || "Please allow location access to load nearby reports.");
        loadingRef.current = false;
        setLoading(false);
        return;
      }
    }

    try {
      const coordKey = `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}`;
      if (lastLoadedCoordsRef.current === coordKey && reports.length > 0) {
        setLoading(false);
        return;
      }
      await loadReports(coords.lat, coords.lng);
      lastLoadedCoordsRef.current = coordKey;
    } catch (reportsError) {
      setError(reportsError.response?.data?.message ?? "Failed to load reports.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchLocation, loadReports, profile, refreshUser, reports.length, user]);

  useEffect(() => { syncLocationAndLoad(); }, [syncLocationAndLoad]);

  useEffect(() => {
    setFiltered(activeTab ? reports.filter((r) => r.status === activeTab) : reports);
  }, [activeTab, reports]);

  const noLocation = !profile?.location?.latitude && !liveLat;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Citizen</p>
          <h2 className="text-2xl font-semibold text-text">Reports Feed</h2>
          <p className="text-xs text-text-muted mt-1">Showing civic reports near your current location.</p>
        </div>
        <Link to="/citizen/reports/new">
          <Button id="new-report-btn" size="sm">+ New report</Button>
        </Link>
      </div>

      {noLocation && (
        <div className="mb-6 rounded-lg border border-warning bg-warning-light px-4 py-3 text-sm text-warning flex items-center justify-between gap-3">
          <span>Your location is not set. Allow location access or update your profile to see reports.</span>
          <Link to="/citizen/profile">
            <Button size="sm" variant="secondary" className="bg-white">Settings</Button>
          </Link>
        </div>
      )}

      {locationMessage && (
        <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          {locationMessage}
        </div>
      )}

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1" role="tablist">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={[
              "px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-ring",
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
          {error} <button onClick={syncLocationAndLoad} className="underline ml-1">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={activeTab ? "No reports with this status" : "No nearby reports yet"}
          description="When citizens report issues near you, they will appear here."
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
