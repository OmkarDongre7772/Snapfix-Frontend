import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getReportApi } from "../../api/reportApi";
import { getAdminReportBidsApi, approveBidApi, rejectBidApi } from "../../api/adminApi";
import StatusBadge from "../../components/StatusBadge";
import CategoryBadge from "../../components/CategoryBadge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

export default function AdminReportDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [report,   setReport]   = useState(null);
  const [bids,     setBids]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Modal state
  const [action, setAction] = useState(null); // { type: 'approve'|'reject', bidId }
  const [acting,  setActing] = useState(false);
  const [actMsg,  setActMsg]  = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const [{ data: rep }, { data: bidList }] = await Promise.all([
          getReportApi(id),
          getAdminReportBidsApi(id),
        ]);
        setReport(rep);
        setBids(bidList);
      } catch { setError("Failed to load report details."); }
      finally   { setLoading(false); }
    })();
  }, [id]);

  const handleAction = async () => {
    if (!action) return;
    setActing(true); setActMsg("");
    try {
      if (action.type === "approve") await approveBidApi(action.bidId);
      else                           await rejectBidApi(action.bidId);
      // Refresh bids
      const { data: refreshed } = await getAdminReportBidsApi(id);
      setBids(refreshed);
      setActMsg(`Bid ${action.type === "approve" ? "approved" : "rejected"} successfully.`);
    } catch (e) {
      setActMsg(e.response?.data?.message ?? `Failed to ${action.type} bid.`);
    } finally { setActing(false); setAction(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)   return <p className="text-center py-20 text-text-muted">{error}</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
        ← All Reports
      </button>

      {/* Report card */}
      {report.imageUrl && (
        <img src={report.imageUrl} alt={report.description}
          className="w-full h-56 object-cover rounded-lg border border-border mb-6" />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <CategoryBadge category={report.category} />
        <StatusBadge status={report.status} />
        
        {/* If report is assigned to a task, show task link */}
        {(report.status !== "CREATED" && report.status !== "REJECTED") && (
          <Link to={`/admin/tasks`}>
            <span className="text-xs font-medium text-accent border border-accent rounded px-2 py-0.5 hover:bg-accent hover:text-white transition-colors cursor-pointer">View Task</span>
          </Link>
        )}
      </div>
      <h2 className="text-xl font-semibold text-text mb-4 leading-snug">{report.description}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
        <MetaCard label="Location">
          {report.lat ? `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}` : "—"}
        </MetaCard>
        <MetaCard label="Support count">{report.supportCount ?? 0}</MetaCard>
        <MetaCard label="Submitted">{formatDate(report.createdAt)}</MetaCard>
        <MetaCard label="Citizen ID">
          <span className="font-mono text-xs break-all">{report.citizenId}</span>
        </MetaCard>
      </div>

      <div className="divider" />

      {/* Bids section */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text">Bids ({bids.length})</h3>
      </div>

      {actMsg && (
        <div className={`mb-4 rounded px-3 py-2 text-sm border ${
          actMsg.includes("success")
            ? "border-success/30 bg-success-light text-success"
            : "border-danger-light bg-danger-light text-danger"
        }`}>
          {actMsg}
        </div>
      )}

      {bids.length === 0 ? (
        <EmptyState icon="🤝" title="No bids yet" description="No workers have placed bids on this report." />
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map((bid) => (
            <Card key={bid.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StatusBadge status={bid.status} />
                    <span className="text-xs text-text-muted">{bid.workerEmail}</span>
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
                      <div>
                        <p className="text-xs text-text-muted">Notes</p>
                        <p className="text-text truncate">{bid.resourceNote}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-text-subtle mt-2">{formatDate(bid.createdAt)}</p>
                </div>

                {/* Action buttons — only for ACTIVE bids */}
                {bid.status === "ACTIVE" && report.status === "CREATED" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      id={`approve-bid-${bid.id}`}
                      size="sm"
                      variant="primary"
                      onClick={() => setAction({ type: "approve", bidId: bid.id })}
                    >
                      Approve
                    </Button>
                    <Button
                      id={`reject-bid-${bid.id}`}
                      size="sm"
                      variant="danger"
                      onClick={() => setAction({ type: "reject", bidId: bid.id })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action?.type === "approve" ? "Approve this bid?" : "Reject this bid?"}
        description={
          action?.type === "approve"
            ? "Approving will assign this worker to the report and reject all other bids."
            : "The bid will be permanently rejected and the worker notified."
        }
        confirmLabel={action?.type === "approve" ? "Approve" : "Reject"}
        confirmVariant={action?.type === "approve" ? "primary" : "danger"}
        onConfirm={handleAction}
        loading={acting}
      />
    </main>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
