import api from "./axios";


export const getAdminPlans = () => api.get("/admin/plans")
export const createPlan = (data) => api.post("/admin/plans", data)
export const updatePlan = (id, data) => api.put(`/admin/plans/${id}`, data)
export const deletePlan = (id) => api.delete(`/admin/plans/${id}`);
export const detectedChanges = () => api.get('/admin/detected');
export const approveChange = (id) => api.post(`/admin/approve/${id}`);
export const rejectChange = (id) => api.post(`/admin/reject/${id}`);
export const uploadCSV = (formData) => api.post('/admin/upload-csv', formData)
export const getAdminStats = () => api.get('/admin/stats')
export const getAuditLogs = (params) => api.get('/admin/audit-logs', { params })
export const getSubmissions = (params) => api.get('/admin/submissions', { params })
export const approveSubmission = (id) => api.post(`/admin/submissions/${id}/approve`)
export const rejectSubmission = (id, data) => api.post(`/admin/submissions/${id}/reject`, data)
export const getPlanSyncSources = () => api.get('/admin/plan-sync/sources')
export const runPlanSync = (data) => api.post('/admin/plan-sync/run', data)
export const getPlanSyncRuns = (params) => api.get('/admin/plan-sync/runs', { params })
export const approveAllNewPlans = (data) => api.post('/admin/approve-new-plans', data)
export const rejectPendingChanges = (data) => api.post('/admin/reject-pending', data)