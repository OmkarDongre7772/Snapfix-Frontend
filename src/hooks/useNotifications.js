import { useCallback, useEffect, useState } from "react";
import { getNotificationsApi, markNotificationReadApi } from "../api/notificationApi";

/**
 * useNotifications — fetches notifications and exposes unread count + mark-read helper.
 * Used both by the Notifications page and the Nav badge.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getNotificationsApi();
      setNotifications(data);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n))
      );
    } catch { /* silent — UI already optimistic */ }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.allSettled(unread.map((n) => markNotificationReadApi(n.notificationId)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, error, unreadCount, markRead, markAllRead, reload: load };
}
