import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAdminStats } from "../api/admin.api";
import { useAuth } from "./AuthContext";

const AdminStatsContext = createContext();

export const AdminStatsProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    if (!user || user.role !== "admin") {
      setPendingCount(0);
      return;
    }
    try {
      const { data } = await getAdminStats();
      const stats = data.stats || {};
      const pending =
        (stats.detectedChanges?.pending || 0) + (stats.submissions?.pending || 0);
      setPendingCount(pending);
    } catch {
      setPendingCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refreshPendingCount();
  }, [loading, refreshPendingCount]);

  return (
    <AdminStatsContext.Provider value={{ pendingCount, refreshPendingCount }}>
      {children}
    </AdminStatsContext.Provider>
  );
};

export const useAdminStats = () => useContext(AdminStatsContext);
