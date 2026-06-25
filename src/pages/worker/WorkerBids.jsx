import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { getMyBidsApi, withdrawBidApi } from "../../api/bidApi";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Card from "../../components/Card";

export default function WorkerBids() {
  const [bids,     setBids]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [withdrawId, setWithdrawId] = useState(null); // bidId pending confirmation
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getMyBidsApi();
      setBids(data);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load bids.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawBidApi(withdrawId);
      setBids((prev) => prev.filter((b) => b.id !== withdrawId));
    } catch { /* ignore */ }
    finally { setWithdrawing(false); setWithdrawId(null); }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="mb-6">
        <p className="section-label mb-1">Worker</p>
        <h2 className="text-2xl font-semibold text-text">My Bids</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={load} className="underline ml-1">Retry</button>
        </div>
      ) : bids.length === 0 ? (
        <EmptyState icon="🤝" title="No bids yet" description="Browse nearby reports and place your first bid to get started." />
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map((bid) => (
            <Card key={bid.id} padding="md" className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StatusBadge status={bid.status} />
                  <span className="text-xs text-text-muted font-mono">{bid.reportId}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-text-muted">Amount</p>
                    <p className="font-semibold text-text">₹{bid.bidAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Duration est.</p>
                    <p className="font-medium text-text">{bid.durationEstimate} day(s)</p>
                  </div>
                  {bid.resourceNote && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-text-muted">Notes</p>
                      <p className="text-text truncate">{bid.resourceNote}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-subtle mt-2">{formatDate(bid.createdAt)}</p>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                {bid.status === "ACTIVE" && (
                  <Button
                    id={`withdraw-bid-${bid.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-light"
                    onClick={() => setWithdrawId(bid.id)}
                  >
                    Withdraw
                  </Button>
                )}
                {bid.status === "APPROVED" && (
                  <Link to="/worker/tasks">
                    <Button size="sm" variant="secondary">Go to Tasks</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        title="Withdraw bid?"
        description="This will remove your bid from the report. You can place a new bid if it's still open."
        confirmLabel="Withdraw"
        onConfirm={handleWithdraw}
        loading={withdrawing}
      />
    </main>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
