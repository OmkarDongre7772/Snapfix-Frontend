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
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getMyBidsApi();
      setBids(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load bids.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawBidApi(withdrawId);
      setBids((prev) => prev.filter((bid) => bid.id !== withdrawId));
    } finally {
      setWithdrawing(false);
      setWithdrawId(null);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="mb-6">
        <p className="section-label mb-1">Worker</p>
        <h2 className="text-2xl font-semibold text-text">My Bids</h2>
        <p className="mt-1 text-xs text-text-muted">Admin accepts or rejects bids from this list.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-lg border border-danger-light bg-danger-light px-4 py-3 text-sm text-danger">
          {error} <button onClick={load} className="ml-1 underline">Retry</button>
        </div>
      ) : bids.length === 0 ? (
        <EmptyState title="No bids yet" description="Browse nearby created reports and place your first bid to get started." />
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map((bid) => (
            <Card key={bid.id} padding="md" className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={bid.status} />
                  <Link to={`/worker/reports/${bid.reportId}`} className="font-mono text-xs text-accent hover:underline">
                    {bid.reportId}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-text-muted">Amount</p>
                    <p className="font-semibold text-text">Rs. {bid.bidAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Estimated time</p>
                    <p className="font-medium text-text">{bid.durationEstimate} day(s)</p>
                  </div>
                  {bid.resourceNote && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-text-muted">Message</p>
                      <p className="truncate text-text">{bid.resourceNote}</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-subtle">{formatDate(bid.createdAt)}</p>
              </div>

              <div className="flex flex-shrink-0 flex-col gap-2">
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
        description="This will remove your bid from the report. You can place a new bid if the report is still open."
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
