import api from "./axiosInstance";

// GET /notifications?unread=true  → List<NotificationResponse>
// Pass unread=true to get only unread; omit for all.
export const getNotificationsApi = (unread) =>
  api.get("/notifications", { params: unread !== undefined ? { unread } : {} });

// PATCH /notifications/{id}/read  → 204 No Content
export const markNotificationReadApi = (id) =>
  api.patch(`/notifications/${id}/read`);
