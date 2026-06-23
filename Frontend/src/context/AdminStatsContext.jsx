import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { detectedChanges } from "../api/admin.api";


const AdminStatsContext = createContext();

export const AdminStatsProvider = ({children}) => {
    const [pendingCount, setPendingCount] = useState()

    const refreshPendingCount = useCallback(async () => {
        try {
            const { data } = await detectedChanges();
            const pending = (data.detectedChanges || []).filter(c => c.status === 'Pending').length;
            setPendingCount(pending);
            } catch (err) {
            console.error('Failed to fetch pending count', err);
        }
    }, [])

    useEffect(() => {refreshPendingCount()}, [refreshPendingCount]);

    return (
        <AdminStatsContext.Provider value={{pendingCount, refreshPendingCount}}>
            {children}
        </AdminStatsContext.Provider>
    )
}

export const useAdminStats = () => useContext(AdminStatsContext)