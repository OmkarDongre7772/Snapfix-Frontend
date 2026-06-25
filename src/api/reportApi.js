import api from "./axiosInstance";

export const createReportApi = (formData) =>
  api.post("/reports", formData);

export const getReportApi = (id) => api.get(`/reports/${id}`);

export const getMyReportsApi = () => api.get("/reports/me");

export const getNearbyReportsApi = (lat, lng, radius = 5000) =>
  api.get("/reports/nearby", { params: { lat, lng, radius } });

export const supportReportApi = (id) => api.post(`/reports/${id}/support`);
