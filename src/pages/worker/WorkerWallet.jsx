import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkerPaymentsApi, getWorkerWalletApi } from "../../api/workerApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";
import Button from "../../components/Button";

export default function WorkerWallet() {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [walletRes, paymentsRes] = await Promise.all([
        getWorkerWalletApi(),
        getWorkerPaymentsApi(),
      ]);
      setWallet(walletRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    return payments.reduce(
      (sum, payment) => {
        const amount = Number(payment.amount ?? 0);
        if (payment.status === "RELEASED") return { ...sum, released: sum.released + amount };
        return { ...sum, pending: sum.pending + amount };
      },
      { pending: 0, released: 0 },
    );
  }, [payments]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) {
    return (
      <p className="py-20 text-center text-text-muted">
        {error} <button onClick={load} className="ml-2 text-accent underline">Retry</button>
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Worker</p>
          <h2 className="text-2xl font-semibold text-text">Wallet</h2>
          <p className="mt-1 text-xs text-text-muted">Balance, pending payments, and released payment transactions.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>Refresh</Button>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Card padding="md" className="bg-accent-light border-accent/20">
          <p className="mb-2 text-sm font-medium text-text-muted">Available Balance</p>
          <p className="text-3xl font-bold text-accent">Rs. {wallet?.balance ?? "0.00"}</p>
          <p className="mt-3 break-all font-mono text-xs text-text-subtle">Wallet ID: {wallet?.id ?? "-"}</p>
        </Card>
        <Card padding="md">
          <p className="mb-2 text-sm font-medium text-text-muted">Pending Payments</p>
          <p className="text-2xl font-semibold text-text">Rs. {totals.pending.toFixed(2)}</p>
        </Card>
        <Card padding="md">
          <p className="mb-2 text-sm font-medium text-text-muted">Released Total</p>
          <p className="text-2xl font-semibold text-text">Rs. {totals.released.toFixed(2)}</p>
        </Card>
      </div>

      <h3 className="mb-4 text-lg font-semibold text-text">Transaction and Payment History</h3>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Complete tasks to earn money. Pending and released payments will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => (
            <Card key={payment.id} padding="md" className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-lg font-semibold text-text">Rs. {payment.amount}</p>
                  <StatusBadge status={payment.status} />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-text-muted">Task:</span>
                  <Link to={`/worker/tasks/${payment.task?.id ?? payment.taskId}`} className="font-mono text-xs text-accent hover:underline">
                    {payment.task?.id ?? payment.taskId ?? "-"}
                  </Link>
                </div>
                <p className="text-xs text-text-subtle">
                  {payment.releasedAt ? `Released on ${formatDate(payment.releasedAt)}` : "Pending admin release"}
                </p>
              </div>
            </Card>
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
