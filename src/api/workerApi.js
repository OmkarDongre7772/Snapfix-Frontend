import api from "./axiosInstance";

// POST /workers/profile  → WorkerProfileDTO
// First-time profile setup: { skills: string[], lat: number, lng: number }
export const setupWorkerProfileApi = (skills, lat, lng) =>
  api.post("/workers/profile", { skills, lat, lng });

// PUT /workers/profile  → WorkerProfileDTO
// Update existing profile
export const updateWorkerProfileApi = (skills, lat, lng) =>
  api.put("/workers/profile", { skills, lat, lng });

// GET /workers/profile  → WorkerProfileDTO
export const getWorkerProfileApi = () => api.get("/workers/profile");

// POST /workers/location  → 200
// Update stored location without changing other profile fields
export const updateWorkerLocationApi = (lat, lng) =>
  api.post("/workers/location", { lat, lng });

// GET /workers/reports/nearby  → List<ReportResponse>
// Uses server-stored worker location — no lat/lng params needed
export const getWorkerNearbyReportsApi = () => api.get("/workers/reports/nearby");

// GET /workers/tasks  → List<TaskResponse>
export const getWorkerTasksApi = () => api.get("/workers/tasks");

// GET /workers/wallet  → WalletResponse
export const getWorkerWalletApi = () => api.get("/workers/wallet");

// GET /workers/payments  → List<PaymentResponse>
export const getWorkerPaymentsApi = () => api.get("/workers/payments");
