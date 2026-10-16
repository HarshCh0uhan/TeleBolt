import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";

const formatWhen = (iso) => {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { unreadCount, items, loading, loadList, markAllRead, markRead, dismiss } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;
    loadList();

    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("pointerdown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, loadList]);

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#58c28d] px-1 text-[10px] font-bold text-[#181818]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1f] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs text-[#58c28d] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-brand">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-zinc-700" />
                <p className="mt-3 text-xs text-zinc-500">No notifications yet.</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`group relative border-b border-white/5 px-4 py-3 transition hover:bg-[#262626] ${
                    n.read ? "" : "bg-[#58c28d]/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className="w-full pr-6 text-left"
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#58c28d]" />
                      )}
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-white">{n.title}</p>
                        {n.body && (
                          <p className="mt-0.5 break-words text-xs text-zinc-400">{n.body}</p>
                        )}
                        <p className="mt-1 text-[10px] text-zinc-600">{formatWhen(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n._id);
                    }}
                    aria-label="Dismiss"
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-lg text-zinc-500 opacity-0 transition hover:text-white group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
