import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification as dismissApi,
} from "../api/notifications.api";

const NotificationsContext = createContext(null);

// How often the bell checks the server. 60s is enough for plan-change data and
// gentle enough that the free Render tier is not woken constantly.
const POLL_MS = 60 * 1000;

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent — a failed poll must not show an error anywhere.
    }
  }, [user]);

  const loadList = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getMyNotifications({ limit: 30 });
      setItems(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent.
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silent.
    }
  }, [user]);

  const markRead = useCallback(async (id) => {
    if (!user) return;
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // Silent.
    }
  }, [user]);

  const dismiss = useCallback(async (id) => {
    if (!user) return;
    setItems((prev) => prev.filter((n) => n._id !== id));
    try {
      await dismissApi(id);
      await refreshUnread();
    } catch {
      // Silent.
    }
  }, [user, refreshUnread]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setItems([]);
      return undefined;
    }

    refreshUnread();

    const tick = () => {
      if (document.visibilityState === "visible") refreshUnread();
    };

    pollRef.current = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshUnread();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refreshUnread]);

  return (
    <NotificationsContext.Provider
      value={{ unreadCount, items, loading, loadList, markAllRead, markRead, dismiss, refreshUnread }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside a NotificationsProvider");
  return ctx;
};
