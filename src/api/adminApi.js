import api from "./axiosInstance";

// GET /admin/reports?status=&page=&size=  → Page<ReportResponse>
// Spring Pageable: { content[], totalElements, totalPages, size, number }
export const getAdminReportsApi = (status, page = 0, size = 15) =>
  api.get("/admin/reports", {
    params: { ...(status ? { status } : {}), page, size },
  });

// GET /admin/reports/{id}/bids  → List<BidResponseDTO>
export const getAdminReportBidsApi = (reportId) =>
  api.get(`/admin/reports/${reportId}/bids`);

// POST /admin/bids/{bidId}/approve  → 200 (no body)
export const approveBidApi = (bidId) =>
  api.post(`/admin/bids/${bidId}/approve`);

// POST /admin/bids/{bidId}/reject  → 200 (no body)
export const rejectBidApi = (bidId) =>
  api.post(`/admin/bids/${bidId}/reject`);

// GET /admin/tasks?status=  → List<TaskResponse>
export const getAdminTasksApi = (status) =>
  api.get("/admin/tasks", { params: status ? { status } : {} });

// GET /admin/tasks/{id}  → TaskDetail
export const getAdminTaskDetailApi = (id) => api.get(`/admin/tasks/${id}`);

// POST /admin/tasks/{taskId}/approve  → TaskResponse
export const approveTaskApi = (taskId) =>
  api.post(`/admin/tasks/${taskId}/approve`);

// POST /admin/tasks/{taskId}/reject  → TaskResponse
export const rejectTaskApi = (taskId) =>
  api.post(`/admin/tasks/${taskId}/reject`);

// POST /admin/payments/{taskId}/release  → PaymentResponse
export const releasePaymentApi = (taskId) =>
  api.post(`/admin/payments/${taskId}/release`);
