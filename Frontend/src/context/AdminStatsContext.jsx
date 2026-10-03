import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAdminStats } from "../api/admin.api";

const AdminStatsContext = createContext();

export const AdminStatsProvider = ({children}) => {
    const [pendingCount, setPendingCount] = useState(0)

    const refreshPendingCount = useCallback(async () => {
        try {
            const { data } = await getAdminStats();
            const stats = data.stats || {};
            const pending = (stats.detectedChanges?.pending || 0) + (stats.submissions?.pending || 0);
            setPendingCount(pending);
        } catch {
            // Non-admins never reach these pages; a failed refresh just shows 0.
            setPendingCount(0);
        }
    }, [])

    useEffect(() => { refreshPendingCount() }, [refreshPendingCount]);

    return (
        <AdminStatsContext.Provider value={{pendingCount, refreshPendingCount}}>
            {children}
        </AdminStatsContext.Provider>
    )
}

export const useAdminStats = () => useContext(AdminStatsContext)
