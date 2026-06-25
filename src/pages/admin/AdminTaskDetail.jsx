import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAdminTaskDetailApi, approveTaskApi, rejectTaskApi, releasePaymentApi } from "../../api/adminApi";
import { reassignTaskApi } from "../../api/taskApi";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";
import Input from "../../components/Input";
import Modal from "../../components/Modal";

export default function AdminTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null); // { task, proof, verification }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  
  const [reassignWorkerId, setReassignWorkerId] = useState("");
  const [showReassign, setShowReassign] = useState(false);

  useEffect(() => {
    loadTaskDetail();
  }, [id]);

  const loadTaskDetail = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getAdminTaskDetailApi(id);
      setDetail(data);
    } catch (e) {
      setError("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionFn, successMsg) => {
    setActionLoading(true); setActionMsg("");
    try {
      await actionFn(id);
      setActionMsg(successMsg);
      await loadTaskDetail();
    } catch (e) {
      setActionMsg(e.response?.data?.message ?? "Action failed.");
    } finally { setActionLoading(false); }
  };

  const handleReassign = async () => {
    if (!reassignWorkerId.trim()) return;
    setActionLoading(true); setActionMsg("");
    try {
      await reassignTaskApi(id, reassignWorkerId.trim());
      setActionMsg("Task reassigned successfully.");
      setShowReassign(false);
      setReassignWorkerId("");
      await loadTaskDetail();
    } catch (e) {
      setActionMsg(e.response?.data?.message ?? "Failed to reassign task.");
    } finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center py-20 text-text-muted">{error}</p>;

  const { task, proof, verification } = detail;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <button onClick={() => navigate("/admin/tasks")} className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
        ← Back to Tasks
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusBadge status={task.status} />
        {task.retryCount > 0 && <span className="text-xs font-medium text-warning border border-warning rounded px-2 py-0.5">Retried {task.retryCount} times</span>}
      </div>

      <h2 className="text-xl font-semibold text-text mb-4">Task Review</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetaCard label="Task ID"><span className="font-mono text-xs break-all">{task.id}</span></MetaCard>
        <MetaCard label="Report ID">
           <Link to={`/admin/reports/${task.reportId}`} className="font-mono text-xs text-accent hover:underline break-all">{task.reportId}</Link>
        </MetaCard>
        <MetaCard label="Worker ID"><span className="font-mono text-xs break-all">{task.workerId}</span></MetaCard>
        <MetaCard label="Assigned At">{formatDate(task.assignedAt)}</MetaCard>
      </div>

      {actionMsg && (
        <div className={`mb-4 rounded px-3 py-2 text-sm border ${
          actionMsg.includes("failed") ? "border-danger-light bg-danger-light text-danger" : "border-success/30 bg-success-light text-success"
        }`}>
          {actionMsg}
        </div>
      )}

      <div className="divider" />

      {/* Proof Section */}
      {proof && (
        <div className="mb-6">
           <h3 className="text-base font-semibold text-text mb-3">Proof of Work</h3>
           <Card padding="md">
              {proof.imageUrl && <img src={proof.imageUrl} alt="Proof" className="w-full h-64 object-cover rounded border border-border mb-4" />}
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div><p className="text-xs text-text-muted">Latitude</p><p className="text-sm text-text">{proof.lat}</p></div>
                 <div><p className="text-xs text-text-muted">Longitude</p><p className="text-sm text-text">{proof.lng}</p></div>
                 <div className="col-span-2"><p className="text-xs text-text-muted">Submitted At</p><p className="text-sm text-text">{formatDate(proof.submittedAt)}</p></div>
                 {proof.remarks && <div className="col-span-2"><p className="text-xs text-text-muted">Worker Remarks</p><p className="text-sm text-text">{proof.remarks}</p></div>}
              </div>
           </Card>
        </div>
      )}

      {/* Verification Section */}
      {verification && (
        <div className="mb-6">
           <h3 className="text-base font-semibold text-text mb-3">Citizen Verification</h3>
           <Card padding="md" className={verification.status === "VERIFIED" ? "bg-success-light border-success/30" : "bg-danger-light border-danger/30"}>
              <div className="flex gap-2 items-center mb-2">
                 <span className={`text-sm font-semibold ${verification.status === "VERIFIED" ? "text-success" : "text-danger"}`}>
                    Citizen marked as {verification.status}
                 </span>
              </div>
              {verification.comments && (
                 <div><p className="text-xs text-text-muted">Comments</p><p className="text-sm text-text">{verification.comments}</p></div>
              )}
           </Card>
        </div>
      )}

      {/* Admin Actions */}
      <h3 className="text-base font-semibold text-text mb-3">Admin Actions</h3>
      <Card padding="md">
         <div className="flex flex-wrap gap-3">
            {task.status === "VERIFIED_BY_CITIZEN" && (
               <>
                  <Button variant="primary" loading={actionLoading} onClick={() => handleAction(approveTaskApi, "Task completed successfully.")}>Approve Completion</Button>
                  <Button variant="danger" loading={actionLoading} onClick={() => handleAction(rejectTaskApi, "Task rejected.")}>Reject Completion</Button>
               </>
            )}
            
            {task.status === "COMPLETED" && (
               <Button variant="primary" loading={actionLoading} onClick={() => handleAction(releasePaymentApi, "Payment released successfully.")}>Release Payment</Button>
            )}
            
            <Button variant="secondary" onClick={() => setShowReassign(true)}>Reassign Task</Button>
         </div>
      </Card>

      <Modal
        open={showReassign}
        onClose={() => setShowReassign(false)}
        title="Reassign Task"
        description="Enter the Worker ID you want to assign this task to. This will cancel the current assignment."
        confirmLabel="Reassign"
        onConfirm={handleReassign}
        loading={actionLoading}
      >
        <div className="mt-4">
           <Input label="New Worker ID" value={reassignWorkerId} onChange={(e) => setReassignWorkerId(e.target.value)} placeholder="UUID" />
        </div>
      </Modal>

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
