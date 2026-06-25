import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getReportApi, supportReportApi } from "../../api/reportApi";
import { getTaskProofApi, rateWorkerApi, verifyTaskApi } from "../../api/taskApi";
import { useAuth } from "../../auth/useAuth";
import StatusBadge from "../../components/StatusBadge";
import CategoryBadge from "../../components/CategoryBadge";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";
import Card from "../../components/Card";

const PROOF_STATUSES = ["PROOF_SUBMITTED", "VERIFIED_BY_CITIZEN", "COMPLETED", "PAYMENT_RELEASED"];
const RATE_STATUSES = ["COMPLETED", "PAYMENT_RELEASED"];

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [taskProof, setTaskProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [notice, setNotice] = useState(location.state?.message ?? "");
  const [verifying, setVerifying] = useState(false);
  const [verifyComments, setVerifyComments] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingMsg, setRatingMsg] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  const loadReport = useCallback(async () => {
    setError("");
    const { data } = await getReportApi(id);
    setReport(data);

    if (data.taskId && PROOF_STATUSES.includes(data.taskStatus)) {
      try {
        const { data: proof } = await getTaskProofApi(data.taskId);
        setTaskProof(proof);
      } catch {
        setTaskProof(null);
      }
    } else {
      setTaskProof(null);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadReport();
      } catch (err) {
        setError(err.response?.status === 404 ? "Report not found." : "Failed to load report.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadReport]);

  const handleSupport = async () => {
    setSupportError("");
    setSupporting(true);
    try {
      const { data } = await supportReportApi(id);
      setReport(data);
      setNotice(data.message ?? "Support added successfully.");
    } catch (err) {
      setSupportError(err.response?.data?.message ?? "Could not add support. You may have already supported this report.");
    } finally {
      setSupporting(false);
    }
  };

  const handleVerify = async (status) => {
    if (!report?.taskId) return;
    setVerifyMsg("");
    setVerifying(true);
    try {
      await verifyTaskApi(report.taskId, status, verifyComments);
      setVerifyMsg(status === "VERIFIED" ? "Proof verified." : "Proof rejected.");
      await loadReport();
    } catch (err) {
      setVerifyMsg(err.response?.data?.message ?? "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRate = async (event) => {
    event.preventDefault();
    if (!report?.workerId || !report?.taskId || !rating) return;
    setRatingMsg("");
    setRatingLoading(true);
    try {
      await rateWorkerApi(report.workerId, {
        taskId: report.taskId,
        score: rating,
        comment: ratingComment,
      });
      setRatingMsg("Rating submitted successfully.");
    } catch (err) {
      setRatingMsg(err.response?.data?.message ?? "Failed to submit rating.");
    } finally {
      setRatingLoading(false);
    }
  };

  const isOwnReport = report?.citizenId === user?.userId;
  const canVerify = isOwnReport && report?.taskStatus === "PROOF_SUBMITTED";
  const canRate = isOwnReport && report?.workerId && report?.taskId && RATE_STATUSES.includes(report?.taskStatus);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-text-muted">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm text-accent">Back</button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
      >
        Back
      </button>

      {notice && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success-light px-4 py-3 text-sm text-success">
          {notice}
        </div>
      )}

      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt={report.description}
          className="mb-6 h-64 w-full rounded-lg border border-border object-cover"
        />
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={report.category} />
        <StatusBadge status={report.status} />
        {report.taskStatus && <StatusBadge status={report.taskStatus} />}
        {isOwnReport && (
          <span className="rounded border border-border px-2 py-0.5 text-xs font-medium text-text-muted">Your report</span>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold leading-snug text-text">{report.description}</h2>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetaItem label="Location">
          {report.lat && report.lng ? `${Number(report.lat).toFixed(5)}, ${Number(report.lng).toFixed(5)}` : "-"}
        </MetaItem>
        <MetaItem label="Submitted">{formatDate(report.createdAt)}</MetaItem>
        <MetaItem label="Support count">
          <span className="font-semibold text-text">{report.supportCount ?? 0}</span>
        </MetaItem>
        <MetaItem label="Report ID">
          <span className="break-all font-mono text-xs">{report.id}</span>
        </MetaItem>
        {report.taskId && (
          <>
            <MetaItem label="Task ID">
              <span className="break-all font-mono text-xs">{report.taskId}</span>
            </MetaItem>
            <MetaItem label="Worker">
              {report.workerName ?? report.workerId ?? "-"}
            </MetaItem>
          </>
        )}
      </div>

      {isOwnReport && report.taskId && (
        <section className="mb-6 border-t border-border pt-5">
          <h3 className="mb-4 text-base font-semibold text-text">Repair Progress</h3>

          {taskProof ? (
            <Card padding="md" className="mb-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text">Worker proof</p>
                <span className="text-xs text-text-muted">{formatDate(taskProof.submittedAt)}</span>
              </div>
              {taskProof.imageUrl && (
                <img src={taskProof.imageUrl} alt="Worker proof" className="mb-3 h-48 w-full rounded-md border border-border object-cover" />
              )}
              <p className="text-sm text-text-muted">{taskProof.remarks || "No remarks added."}</p>
              {taskProof.lat && taskProof.lng && (
                <p className="mt-2 text-xs text-text-muted">
                  Proof location: {Number(taskProof.lat).toFixed(5)}, {Number(taskProof.lng).toFixed(5)}
                </p>
              )}
            </Card>
          ) : (
            <Card padding="md" className="mb-4">
              <p className="text-sm text-text-muted">No proof has been submitted yet.</p>
            </Card>
          )}

          {canVerify && (
            <Card padding="md" className="mb-4">
              <p className="mb-3 text-sm text-text">Review the submitted proof and confirm whether the issue is fixed.</p>
              <textarea
                className="input-base mb-3 text-sm"
                rows={3}
                maxLength={1000}
                placeholder="Optional verification comments"
                value={verifyComments}
                onChange={(event) => setVerifyComments(event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Button size="sm" loading={verifying} onClick={() => handleVerify("VERIFIED")}>Verify fix</Button>
                <Button size="sm" variant="danger" loading={verifying} onClick={() => handleVerify("REJECTED")}>Reject proof</Button>
              </div>
              {verifyMsg && <p className="mt-2 text-xs text-text-muted">{verifyMsg}</p>}
            </Card>
          )}

          {canRate && (
            <Card padding="md">
              <p className="mb-2 text-sm font-semibold text-text">Rate the worker</p>
              <form onSubmit={handleRate}>
                <div className="mb-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      type="button"
                      key={score}
                      onClick={() => setRating(score)}
                      className={`text-2xl ${rating >= score ? "text-yellow-500" : "text-gray-300"}`}
                      aria-label={`${score} star rating`}
                    >
                      *
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-base mb-3 text-sm"
                  rows={2}
                  placeholder="Leave a comment (optional)"
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                />
                <Button size="sm" type="submit" loading={ratingLoading} disabled={!rating}>Submit rating</Button>
                {ratingMsg && <p className="mt-2 text-xs text-text-muted">{ratingMsg}</p>}
              </form>
            </Card>
          )}
        </section>
      )}

      {user?.role === "CITIZEN" && !isOwnReport && (
        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm text-text-muted">Show your support for this report.</p>
          <Button id="support-report-btn" variant="secondary" onClick={handleSupport} loading={supporting}>
            Support this report
          </Button>
          {supportError && <p className="mt-2 text-xs text-danger">{supportError}</p>}
        </div>
      )}
    </main>
  );
}

function MetaItem({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
