import api from "./axios";


export const getAdminPlans = () => api.get("/admin/plans")
export const createPlan = (data) => api.post("/admin/plans", data)
export const updatePlan = (id, data) => api.put(`/admin/plans/${id}`, data)
export const deletePlan = (id) => api.delete(`/admin/plans/${id}`);
export const detectedChanges = () => api.get('/admin/detected');
export const approveChange = (id) => api.post(`/admin/approve/${id}`);
export const rejectChange = (id) => api.post(`/admin/reject/${id}`);
export const uploadCSV = (formData) => api.post('/admin/upload-csv', formData)