import { useContext } from "react";
import { NotificationsContext } from "./NotificationsContext";

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside a NotificationsProvider");
  return ctx;
};
