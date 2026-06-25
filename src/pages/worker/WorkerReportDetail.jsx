import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReportApi } from "../../api/reportApi";
import { getMyBidsApi, placeBidApi } from "../../api/bidApi";
import StatusBadge from "../../components/StatusBadge";
import CategoryBadge from "../../components/CategoryBadge";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";

export default function WorkerReportDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();

  const [report,    setReport]    = useState(null);
  const [myBid,     setMyBid]     = useState(null); // existing bid on this report, if any
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [amount,    setAmount]    = useState("");
  const [duration,  setDuration]  = useState("");
  const [note,      setNote]      = useState("");
  const [bidErrors, setBidErrors] = useState({});
  const [bidding,   setBidding]   = useState(false);
  const [bidMsg,    setBidMsg]    = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const [{ data: rep }, { data: bids }] = await Promise.all([
          getReportApi(id),
          getMyBidsApi(),
        ]);
        setReport(rep);
        const existing = bids.find((b) => b.reportId === rep.id);
        if (existing) setMyBid(existing);
      } catch (e) {
        setError("Failed to load report details.");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const validateBid = () => {
    const e = {};
    if (!amount || isNaN(amount) || Number(amount) < 0) e.amount   = "Enter a valid bid amount (≥ 0).";
    if (!duration || isNaN(duration) || Number(duration) < 0) e.duration = "Enter estimated days (≥ 0).";
    return e;
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidMsg("");
    const errs = validateBid();
    if (Object.keys(errs).length) { setBidErrors(errs); return; }
    setBidding(true);
    try {
      const { data } = await placeBidApi(report.id, Number(amount), Number(duration), note);
      setMyBid(data);
      setBidMsg("Bid placed successfully!");
    } catch (err) {
      const msg = err.response?.status === 409
        ? "You've already placed a bid on this report."
        : err.response?.data?.message ?? "Failed to place bid.";
      setBidMsg(msg);
    } finally { setBidding(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)   return <p className="text-center py-20 text-text-muted">{error}</p>;

  const canBid = report.status === "CREATED" && !myBid;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
        ← Back
      </button>

      {/* Report image */}
      {report.imageUrl && (
        <img src={report.imageUrl} alt={report.description}
          className="w-full h-56 object-cover rounded-lg border border-border mb-6" />
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <CategoryBadge category={report.category} />
        <StatusBadge status={report.status} />
      </div>
      <h2 className="text-xl font-semibold text-text mb-4 leading-snug">{report.description}</h2>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetaCard label="Location">{report.lat ? `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}` : "—"}</MetaCard>
        <MetaCard label="Support count">{report.supportCount ?? 0}</MetaCard>
      </div>

      <div className="divider" />

      {/* Bid section */}
      {myBid ? (
        <Card padding="md" className="border-success/30 bg-success-light">
          <p className="text-sm font-semibold text-success mb-2">✓ Your bid is placed</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-text-muted">Bid amount</p><p className="font-medium text-text">₹{myBid.bidAmount}</p></div>
            <div><p className="text-xs text-text-muted">Duration est.</p><p className="font-medium text-text">{myBid.durationEstimate} day(s)</p></div>
            <div><p className="text-xs text-text-muted">Status</p><StatusBadge status={myBid.status} /></div>
            {myBid.resourceNote && <div><p className="text-xs text-text-muted">Notes</p><p className="text-text">{myBid.resourceNote}</p></div>}
          </div>
        </Card>
      ) : canBid ? (
        <div>
          <h3 className="text-base font-semibold text-text mb-4">Place a bid</h3>
          <form onSubmit={handlePlaceBid} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input id="bid-amount" label="Bid amount (₹)" type="number" min="0" step="0.01"
                placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} error={bidErrors.amount} />
              <Input id="bid-duration" label="Duration estimate (days)" type="number" min="0"
                placeholder="3" value={duration} onChange={(e) => setDuration(e.target.value)} error={bidErrors.duration} />
            </div>
            <div>
              <label htmlFor="bid-note" className="field-label">Resource note (optional)</label>
              <textarea id="bid-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Tools, materials, or special notes…"
                className="input-base resize-none" />
            </div>
            {bidMsg && <p className="text-sm text-danger">{bidMsg}</p>}
            <Button id="place-bid-btn" type="submit" loading={bidding}>Place bid</Button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          {report.status !== "CREATED" ? "This report is no longer accepting bids." : ""}
        </p>
      )}
      {bidMsg && myBid && <p className="text-sm text-success mt-3">{bidMsg}</p>}
    </main>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm font-medium text-text">{children}</p>
    </div>
  );
}
