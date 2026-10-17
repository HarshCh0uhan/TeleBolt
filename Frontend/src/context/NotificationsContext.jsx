import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification as dismissApi,
} from "../api/notifications.api";

export const NotificationsContext = createContext(null);

// How often the bell checks the server. 60s is enough for plan-change data and
// gentle enough that the free Render tier is not woken constantly.
const POLL_MS = 60 * 1000;

const noop = async () => {};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
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

  // Poll only while the user is logged in. The guest case has no interval and no
  // state reset — consumers derive "logged out" from the context value below.
  useEffect(() => {
    if (!user) return undefined;

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

  // Derived: a guest never sees unread items or old notifications, without ever
  // having to reset the underlying state inside an effect.
  const value = useMemo(() => {
    if (!user) {
      return {
        unreadCount: 0,
        items: [],
        loading: false,
        loadList: noop,
        markAllRead: noop,
        markRead: noop,
        dismiss: noop,
        refreshUnread: noop,
      };
    }
    return { unreadCount, items, loading, loadList, markAllRead, markRead, dismiss, refreshUnread };
  }, [user, unreadCount, items, loading, loadList, markAllRead, markRead, dismiss, refreshUnread]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
