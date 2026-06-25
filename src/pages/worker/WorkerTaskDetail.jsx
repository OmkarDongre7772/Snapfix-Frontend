import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskApi, retryTaskApi, startTaskApi, uploadProofApi } from "../../api/taskApi";
import { useGeolocation } from "../../hooks/useGeolocation";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";

export default function WorkerTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const fileRef = useRef(null);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofRemarks, setProofRemarks] = useState("");
  const [proofError, setProofError] = useState("");

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getTaskApi(id);
      setTask(data);
    } catch {
      setError("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadTask(); }, [loadTask]);

  const handleStart = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await startTaskApi(id);
      await loadTask();
    } catch (err) {
      setActionMsg(err.response?.data?.message ?? "Failed to start task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await retryTaskApi(id);
      await loadTask();
    } catch (err) {
      setActionMsg(err.response?.data?.message ?? "Failed to retry task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setProofImage(file);
    setProofPreview(URL.createObjectURL(file));
    setProofError("");
  };

  const validateProof = () => {
    if (!proofImage) return "Please select an image showing the completed work.";
    if (!geo.lat || !geo.lng) return "Please detect your current GPS location.";
    if (!proofRemarks.trim()) return "Please add proof remarks.";
    if (proofRemarks.length > 1000) return "Remarks must be at most 1000 characters.";
    return "";
  };

  const handleUploadProof = async (event) => {
    event.preventDefault();
    const validationError = validateProof();
    if (validationError) {
      setProofError(validationError);
      return;
    }

    setProofError("");
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", proofImage);
      fd.append("lat", geo.lat);
      fd.append("lng", geo.lng);
      fd.append("remarks", proofRemarks.trim());

      await uploadProofApi(id, fd);
      setProofImage(null);
      setProofPreview(null);
      setProofRemarks("");
      await loadTask();
    } catch (err) {
      setProofError(err.response?.data?.message ?? "Failed to upload proof.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="py-20 text-center text-text-muted">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate("/worker/tasks")} className="mb-6 flex items-center gap-1 text-sm text-text-muted hover:text-text">
        Back to Tasks
      </button>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        {task.retryCount > 0 && (
          <span className="rounded border border-warning px-2 py-0.5 text-xs font-medium text-warning">
            Retried {task.retryCount} time{task.retryCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-text">Task Details</h2>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetaCard label="Report ID"><span className="font-mono text-xs">{task.reportId}</span></MetaCard>
        <MetaCard label="Task ID"><span className="font-mono text-xs">{task.id}</span></MetaCard>
        <MetaCard label="Assigned At">{formatDate(task.assignedAt)}</MetaCard>
      </div>

      {actionMsg && <div className="mb-4 text-sm text-danger">{actionMsg}</div>}

      <div className="divider" />

      {task.status === "ASSIGNED" && (
        <Card padding="md" className="border-accent/30 bg-accent-light text-center">
          <p className="mb-4 text-sm text-text">You have been assigned to this report. Start the task once work begins.</p>
          <Button onClick={handleStart} loading={actionLoading}>Start Task</Button>
        </Card>
      )}

      {task.status === "IN_PROGRESS" && (
        <div>
          <h3 className="mb-4 text-base font-semibold text-text">Submit Proof of Work</h3>
          <form onSubmit={handleUploadProof} className="flex flex-col gap-4">
            <Card padding="sm">
              <p className="field-label mb-3">Photo evidence</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              {proofPreview ? (
                <div className="relative">
                  <img src={proofPreview} alt="Preview" className="h-48 w-full rounded-md border border-border object-cover" />
                  <button
                    type="button"
                    onClick={() => { setProofImage(null); setProofPreview(null); }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    x
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <span className="text-sm font-medium">Upload completed work photo</span>
                </button>
              )}
            </Card>

            <Card padding="sm">
              <p className="field-label mb-3">Live GPS location</p>
              <p className="mb-3 text-xs text-text-muted">Detect your current location at the repaired site.</p>
              <Button type="button" variant="secondary" size="sm" loading={geo.loading} onClick={geo.fetch} className="mb-2">
                {geo.lat ? "Location detected" : "Detect location"}
              </Button>
              {geo.lat && geo.lng && (
                <p className="text-xs text-text-muted">{Number(geo.lat).toFixed(5)}, {Number(geo.lng).toFixed(5)}</p>
              )}
              {geo.error && <p className="text-xs text-danger">{geo.error}</p>}
            </Card>

            <div>
              <label htmlFor="proof-remarks" className="field-label">Proof remarks</label>
              <textarea
                id="proof-remarks"
                rows={3}
                value={proofRemarks}
                onChange={(event) => setProofRemarks(event.target.value)}
                className="input-base resize-none"
                placeholder="Describe what you fixed and any materials used."
              />
            </div>

            {proofError && <p className="text-sm text-danger">{proofError}</p>}

            <Button type="submit" loading={actionLoading} disabled={!geo.lat || !proofImage || !proofRemarks.trim()}>
              Submit Proof for Verification
            </Button>
          </form>
        </div>
      )}

      {task.status === "PROOF_SUBMITTED" && (
        <Card padding="md" className="border-success/30 bg-success-light text-center">
          <p className="mb-2 text-sm font-semibold text-success">Proof submitted successfully</p>
          <p className="text-sm text-text">Waiting for the citizen to verify your work.</p>
        </Card>
      )}

      {task.status === "REJECTED" && (
        <Card padding="md" className="border-danger bg-danger-light text-center">
          <p className="mb-2 text-sm font-semibold text-danger">Work rejected</p>
          <p className="mb-4 text-sm text-text">Address the issue and retry the task. You can submit proof again after retrying.</p>
          <Button variant="danger" onClick={handleRetry} loading={actionLoading}>Retry Task</Button>
        </Card>
      )}

      {task.status === "VERIFIED_BY_CITIZEN" && (
        <Card padding="md" className="border-success/30 bg-success-light text-center">
          <p className="mb-2 text-sm font-semibold text-success">Work verified by citizen</p>
          <p className="text-sm text-text">Waiting for admin approval before payment can be released.</p>
        </Card>
      )}

      {(task.status === "COMPLETED" || task.status === "PAYMENT_RELEASED") && (
        <Card padding="md" className="border-success/30 bg-success-light text-center">
          <p className="mb-2 text-sm font-semibold text-success">Task completed</p>
          <p className="text-sm text-text">Payment status is available in your wallet history.</p>
        </Card>
      )}
    </main>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      <div className="text-sm font-medium text-text">{children}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
