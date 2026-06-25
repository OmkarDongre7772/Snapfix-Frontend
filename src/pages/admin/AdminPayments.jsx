import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminTasksApi, releasePaymentApi } from "../../api/adminApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";
import Button from "../../components/Button";

export default function AdminPayments() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [releasingId, setReleasingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Get all completed tasks. Payment released tasks might not be fetched here unless we get all,
      // but let's fetch all tasks and filter client-side for COMPLETED and PAYMENT_RELEASED
      const { data } = await getAdminTasksApi();
      setTasks(data.filter(t => t.status === "COMPLETED" || t.status === "PAYMENT_RELEASED"));
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRelease = async (taskId) => {
     setReleasingId(taskId);
     try {
        await releasePaymentApi(taskId);
        await load(); // Reload to get updated status
     } catch(e) {
        alert(e.response?.data?.message || "Failed to release payment");
     } finally {
        setReleasingId(null);
     }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Admin</p>
          <h2 className="text-2xl font-semibold text-text">Payments</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={load} className="underline ml-1">Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon="💸" title="No payments" description="There are no completed tasks awaiting payment." />
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <Card key={task.id} padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={task.status} />
                    <Link to={`/admin/tasks/${task.id}`} className="text-xs text-accent hover:underline font-mono">
                      Task: {task.id}
                    </Link>
                 </div>
                 <p className="text-sm font-medium text-text">Report: {task.reportId}</p>
                 <p className="text-xs text-text-subtle mt-1 font-mono">Worker: {task.workerId}</p>
              </div>
              <div>
                 {task.status === "COMPLETED" ? (
                    <Button 
                       size="sm" 
                       loading={releasingId === task.id} 
                       onClick={() => handleRelease(task.id)}
                    >
                       Release Payment
                    </Button>
                 ) : (
                    <Button size="sm" variant="secondary" disabled>Payment Released</Button>
                 )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
