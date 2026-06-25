import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getWorkerWalletApi, getWorkerPaymentsApi } from "../../api/workerApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";

export default function WorkerWallet() {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [walletRes, paymentsRes] = await Promise.all([
        getWorkerWalletApi(),
        getWorkerPaymentsApi()
      ]);
      setWallet(walletRes.data);
      setPayments(paymentsRes.data);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center py-20 text-text-muted">{error} <button onClick={load} className="text-accent underline ml-2">Retry</button></p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label mb-1">Worker</p>
          <h2 className="text-2xl font-semibold text-text">My Wallet</h2>
        </div>
      </div>

      <Card padding="lg" className="mb-8 text-center bg-accent-light border-accent/20">
        <p className="text-sm font-medium text-text-muted mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-accent">₹{wallet?.balance ?? "0.00"}</p>
        <p className="text-xs text-text-subtle mt-3 font-mono">Wallet ID: {wallet?.id}</p>
      </Card>

      <h3 className="text-lg font-semibold text-text mb-4">Payment History</h3>

      {payments.length === 0 ? (
        <EmptyState icon="💸" title="No payments yet" description="Complete tasks to earn money. Your payments will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map(payment => (
            <Card key={payment.id} padding="md" className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-text mb-1">₹{payment.amount}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-text-muted">Task:</span>
                  <Link to={`/worker/tasks/${payment.task.id}`} className="text-xs text-accent hover:underline font-mono">
                    {payment.task.id}
                  </Link>
                </div>
                <p className="text-xs text-text-subtle">
                   {payment.releasedAt ? `Released on ${formatDate(payment.releasedAt)}` : "Pending Release"}
                </p>
              </div>
              <div>
                <StatusBadge status={payment.status} />
              </div>
            </Card>
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
