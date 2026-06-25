import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkerTasksApi } from "../../api/taskApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PROOF_SUBMITTED", label: "Pending Verification" },
  { value: "REJECTED", label: "Rejected" },
  { value: "VERIFIED_BY_CITIZEN", label: "Admin Review" },
  { value: "COMPLETED", label: "Completed" },
];

export default function WorkerTasks() {
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getWorkerTasksApi();
      setTasks(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeTab === "COMPLETED") {
      setFiltered(tasks.filter((task) => task.status === "COMPLETED" || task.status === "PAYMENT_RELEASED"));
    } else {
      setFiltered(activeTab ? tasks.filter((task) => task.status === activeTab) : tasks);
    }
  }, [activeTab, tasks]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="mb-6">
        <p className="section-label mb-1">Worker</p>
        <h2 className="text-2xl font-semibold text-text">My Tasks</h2>
        <p className="mt-1 text-xs text-text-muted">Assigned work moves through start, proof, citizen verification, admin review, and payment.</p>
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
              activeTab === value ? "bg-accent text-white" : "text-text-muted hover:text-text hover:bg-[var(--color-muted-bg)]",
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
          {error} <button onClick={load} className="ml-1 underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No tasks" description="No tasks found matching this filter." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((task) => (
            <Link key={task.id} to={`/worker/tasks/${task.id}`} className="block no-underline">
              <Card padding="md" className="group cursor-pointer transition-all duration-150 hover:border-accent/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge status={task.status} />
                      <span className="font-mono text-xs text-text-muted">Task: {task.id}</span>
                    </div>
                    <p className="text-sm font-medium text-text transition-colors group-hover:text-accent">
                      Report ID: {task.reportId}
                    </p>
                    <p className="mt-1 text-xs text-text-subtle">Assigned: {formatDate(task.assignedAt)}</p>
                  </div>
                  <div className="self-center text-text-subtle group-hover:text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
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
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
