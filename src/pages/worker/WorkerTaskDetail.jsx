import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskApi, startTaskApi, uploadProofApi, retryTaskApi } from "../../api/taskApi";
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
  const [error, setError] = useState(null);

  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  
  // Proof form state
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofRemarks, setProofRemarks] = useState("");
  const [proofError, setProofError] = useState("");

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getTaskApi(id);
      setTask(data);
    } catch (e) {
      setError("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true); setActionMsg("");
    try {
      await startTaskApi(id);
      await loadTask();
    } catch (e) {
      setActionMsg(e.response?.data?.message ?? "Failed to start task.");
    } finally { setActionLoading(false); }
  };

  const handleRetry = async () => {
    setActionLoading(true); setActionMsg("");
    try {
      await retryTaskApi(id);
      await loadTask();
    } catch (e) {
      setActionMsg(e.response?.data?.message ?? "Failed to retry task.");
    } finally { setActionLoading(false); }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofImage(file);
    setProofPreview(URL.createObjectURL(file));
    setProofError("");
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    setProofError("");
    if (!proofImage) { setProofError("Please select an image showing the completed work."); return; }
    if (!geo.lat) { setProofError("Please detect your location first."); return; }

    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", proofImage);
      fd.append("lat", geo.lat);
      fd.append("lng", geo.lng);
      if (proofRemarks.trim()) fd.append("remarks", proofRemarks.trim());

      await uploadProofApi(id, fd);
      await loadTask();
    } catch (err) {
      setProofError(err.response?.data?.message ?? "Failed to upload proof.");
    } finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center py-20 text-text-muted">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate("/worker/tasks")} className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
        ← Back to Tasks
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusBadge status={task.status} />
        {task.retryCount > 0 && <span className="text-xs font-medium text-warning border border-warning rounded px-2 py-0.5">Retried {task.retryCount} times</span>}
      </div>

      <h2 className="text-xl font-semibold text-text mb-4">Task Details</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetaCard label="Report ID"><span className="font-mono text-xs">{task.reportId}</span></MetaCard>
        <MetaCard label="Task ID"><span className="font-mono text-xs">{task.id}</span></MetaCard>
        <MetaCard label="Assigned At">{formatDate(task.assignedAt)}</MetaCard>
      </div>

      {actionMsg && <div className="mb-4 text-sm text-danger">{actionMsg}</div>}

      <div className="divider" />

      {/* Task Actions depending on Status */}
      {task.status === "ASSIGNED" && (
        <Card padding="md" className="border-accent/30 bg-accent-light text-center">
          <p className="text-sm text-text mb-4">You have been assigned to this report. Once you arrive and begin work, update the status.</p>
          <Button onClick={handleStart} loading={actionLoading}>Start Task</Button>
        </Card>
      )}

      {task.status === "IN_PROGRESS" && (
        <div>
          <h3 className="text-base font-semibold text-text mb-4">Submit Proof of Work</h3>
          <form onSubmit={handleUploadProof} className="flex flex-col gap-4">
            <Card padding="sm">
              <p className="field-label mb-3">Photo evidence</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              {proofPreview ? (
                <div className="relative">
                  <img src={proofPreview} alt="Preview" className="w-full h-48 object-cover rounded-md border border-border" />
                  <button type="button" onClick={() => { setProofImage(null); setProofPreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80">✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className={`w-full h-36 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent hover:text-accent transition-colors ${proofError && !proofImage ? "border-danger text-danger" : "border-border"}`}>
                  <span className="text-3xl">📷</span>
                  <span className="text-sm font-medium">Click to upload photo of completed work</span>
                </button>
              )}
            </Card>

            <Card padding="sm">
              <p className="field-label mb-3">Your Location</p>
              <p className="text-xs text-text-muted mb-3">We need your current location to verify you are at the repair site.</p>
              <Button type="button" variant="secondary" size="sm" loading={geo.loading} onClick={geo.fetch} className="mb-2">
                {geo.lat ? "📍 Location detected" : "Detect Location"}
              </Button>
              {geo.error && <p className="text-xs text-danger">{geo.error}</p>}
            </Card>

            <div>
              <label className="field-label">Remarks (Optional)</label>
              <textarea rows={2} value={proofRemarks} onChange={(e) => setProofRemarks(e.target.value)} className="input-base resize-none" placeholder="Any notes about the fix..." />
            </div>

            {proofError && <p className="text-sm text-danger">{proofError}</p>}
            
            <Button type="submit" loading={actionLoading} disabled={!geo.lat || !proofImage}>Submit Proof for Verification</Button>
          </form>
        </div>
      )}

      {task.status === "PROOF_SUBMITTED" && (
        <Card padding="md" className="bg-success-light border-success/30 text-center">
           <p className="text-sm font-semibold text-success mb-2">Proof Submitted Successfully</p>
           <p className="text-sm text-text">Waiting for the citizen to verify your work.</p>
        </Card>
      )}

      {task.status === "REJECTED" && (
        <Card padding="md" className="bg-danger-light border-danger text-center">
           <p className="text-sm font-semibold text-danger mb-2">Work Rejected</p>
           <p className="text-sm text-text mb-4">The citizen reported that the issue is not fixed. Please address the problem and submit proof again.</p>
           <Button variant="danger" onClick={handleRetry} loading={actionLoading}>Retry Task</Button>
        </Card>
      )}

      {task.status === "VERIFIED_BY_CITIZEN" && (
        <Card padding="md" className="bg-success-light border-success/30 text-center">
           <p className="text-sm font-semibold text-success mb-2">Work Verified by Citizen</p>
           <p className="text-sm text-text">Pending final approval from an administrator for payment release.</p>
        </Card>
      )}

      {(task.status === "COMPLETED" || task.status === "PAYMENT_RELEASED") && (
        <Card padding="md" className="bg-success-light border-success/30 text-center">
           <p className="text-sm font-semibold text-success mb-2">Task Completed</p>
           <p className="text-sm text-text">Great job! This task is fully resolved.</p>
        </Card>
      )}
    </main>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card-base p-3">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="text-sm text-text font-medium">{children}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
