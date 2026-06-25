import api from "./axiosInstance";

// ── WORKER ENDPOINTS ────────────────────────────────────────────────────────

// GET /workers/tasks
export const getWorkerTasksApi = () => api.get("/workers/tasks");

// GET /tasks/{id}
export const getTaskApi = (id) => api.get(`/tasks/${id}`);

// PATCH /tasks/{id}/start
export const startTaskApi = (id) => api.patch(`/tasks/${id}/start`);

// POST /tasks/{taskId}/proof  (multipart/form-data)
export const uploadProofApi = (taskId, formData) =>
  api.post(`/tasks/${taskId}/proof`, formData);

// POST /tasks/{taskId}/retry
export const retryTaskApi = (taskId) => api.post(`/tasks/${taskId}/retry`);

// ── CITIZEN / ADMIN ENDPOINTS ───────────────────────────────────────────────

// GET /tasks/{taskId}/proof
export const getTaskProofApi = (taskId) => api.get(`/tasks/${taskId}/proof`);

// POST /tasks/{taskId}/verify
export const verifyTaskApi = (taskId, status, comments) =>
  api.post(`/tasks/${taskId}/verify`, null, {
    params: { status, comments },
  });

// POST /workers/{workerId}/rating
export const rateWorkerApi = (workerId, request) =>
  api.post(`/workers/${workerId}/rating`, request);

// GET /workers/{workerId}/rating
export const getWorkerRatingSummaryApi = (workerId) =>
  api.get(`/workers/${workerId}/rating`);

// ── ADMIN ENDPOINTS (Tasks & Payments) ──────────────────────────────────────
// Additional Admin task/payment endpoints that were missing from adminApi.js

// POST /admin/tasks/{taskId}/reassign
export const reassignTaskApi = (taskId, newWorkerId) =>
  api.post(`/admin/tasks/${taskId}/reassign`, { newWorkerId });
