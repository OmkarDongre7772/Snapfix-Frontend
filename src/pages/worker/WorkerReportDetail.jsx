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
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [myBid, setMyBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");
  const [bidErrors, setBidErrors] = useState({});
  const [bidding, setBidding] = useState(false);
  const [bidMsg, setBidMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [{ data: rep }, { data: bids }] = await Promise.all([
          getReportApi(id),
          getMyBidsApi(),
        ]);
        setReport(rep);
        setMyBid(bids.find((bid) => bid.reportId === rep.id) ?? null);
      } catch {
        setError("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const validateBid = () => {
    const nextErrors = {};
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      nextErrors.amount = "Enter a bid amount greater than 0.";
    }
    if (!duration || Number.isNaN(Number(duration)) || Number(duration) <= 0) {
      nextErrors.duration = "Enter estimated completion time in days.";
    }
    if (!message.trim()) {
      nextErrors.message = "Add a message for the admin.";
    } else if (message.length > 1000) {
      nextErrors.message = "Message must be at most 1000 characters.";
    }
    return nextErrors;
  };

  const handlePlaceBid = async (event) => {
    event.preventDefault();
    setBidMsg("");
    const nextErrors = validateBid();
    if (Object.keys(nextErrors).length) {
      setBidErrors(nextErrors);
      return;
    }

    setBidding(true);
    try {
      const { data } = await placeBidApi(report.id, Number(amount), Number(duration), message.trim());
      setMyBid(data);
      setBidMsg("Bid placed successfully. Admin will review it.");
    } catch (err) {
      setBidMsg(err.response?.data?.message ?? "Failed to place bid.");
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="py-20 text-center text-text-muted">{error}</p>;

  const canBid = report.status === "CREATED" && !myBid;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-text-muted hover:text-text">
        Back
      </button>

      {report.imageUrl && (
        <img src={report.imageUrl} alt={report.description} className="mb-6 h-56 w-full rounded-lg border border-border object-cover" />
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={report.category} />
        <StatusBadge status={report.status} />
      </div>
      <h2 className="mb-4 text-xl font-semibold leading-snug text-text">{report.description}</h2>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetaCard label="Location">{report.lat ? `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}` : "-"}</MetaCard>
        <MetaCard label="Support count">{report.supportCount ?? 0}</MetaCard>
      </div>

      <div className="divider" />

      {myBid ? (
        <Card padding="md" className="border-success/30 bg-success-light">
          <p className="mb-2 text-sm font-semibold text-success">Your bid is placed</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-muted">Bid amount</p>
              <p className="font-medium text-text">Rs. {myBid.bidAmount}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Estimated time</p>
              <p className="font-medium text-text">{myBid.durationEstimate} day(s)</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <StatusBadge status={myBid.status} />
            </div>
            {myBid.resourceNote && (
              <div className="col-span-2">
                <p className="text-xs text-text-muted">Message</p>
                <p className="text-text">{myBid.resourceNote}</p>
              </div>
            )}
          </div>
          {bidMsg && <p className="mt-3 text-sm text-success">{bidMsg}</p>}
        </Card>
      ) : canBid ? (
        <div>
          <h3 className="mb-4 text-base font-semibold text-text">Place a bid</h3>
          <form onSubmit={handlePlaceBid} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="bid-amount"
                label="Bid amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="500"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                error={bidErrors.amount}
              />
              <Input
                id="bid-duration"
                label="Estimated time (days)"
                type="number"
                min="1"
                step="1"
                placeholder="3"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                error={bidErrors.duration}
              />
            </div>
            <div>
              <label htmlFor="bid-message" className="field-label">Message to admin</label>
              <textarea
                id="bid-message"
                rows={3}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (bidErrors.message) setBidErrors((prev) => ({ ...prev, message: "" }));
                }}
                placeholder="Explain your approach, materials, and availability."
                className={`input-base resize-none ${bidErrors.message ? "border-danger" : ""}`}
              />
              {bidErrors.message && <p className="mt-1 text-xs text-danger">{bidErrors.message}</p>}
            </div>
            {bidMsg && <p className="text-sm text-danger">{bidMsg}</p>}
            <Button id="place-bid-btn" type="submit" loading={bidding}>Place bid</Button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-text-muted">This report is no longer accepting bids.</p>
      )}
    </main>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{children}</p>
    </div>
  );
}
