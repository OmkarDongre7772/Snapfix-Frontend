import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminTasksApi } from "../../api/adminApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PROOF_SUBMITTED", label: "Proof Submitted" },
  { value: "VERIFIED_BY_CITIZEN", label: "Citizen Verified" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAYMENT_RELEASED", label: "Paid" },
];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getAdminTasksApi();
      setTasks(data);
      setFiltered(data);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFiltered(activeTab ? tasks.filter((t) => t.status === activeTab) : tasks);
  }, [activeTab, tasks]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Admin</p>
          <h2 className="text-2xl font-semibold text-text">Task Management</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1" role="tablist">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={label} role="tab" aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={["px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-ring",
              activeTab === value ? "bg-accent text-white" : "text-text-muted hover:text-text hover:bg-[var(--color-muted-bg)]"
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
        <EmptyState icon="✅" title="No tasks" description="No tasks found matching this filter." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(task => (
            <Link key={task.id} to={`/admin/tasks/${task.id}`} className="no-underline block">
              <Card padding="md" className="group hover:border-accent/40 hover:shadow-md transition-all duration-150 cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      <span className="text-xs text-text-muted font-mono">Task: {task.id}</span>
                    </div>
                    <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                      Report: {task.reportId}
                    </p>
                    <p className="text-xs text-text-subtle mt-1 flex gap-4">
                       <span>Assigned: {formatDate(task.assignedAt)}</span>
                       <span>Worker: {task.workerId}</span>
                    </p>
                  </div>
                  <div className="text-text-subtle group-hover:text-accent self-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
