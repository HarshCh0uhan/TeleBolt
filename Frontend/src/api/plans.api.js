import api from "./axios";


export const getPlans = (filters) => api.get("/plans/", {params: filters})
export const getSinglePlan = (id) => api.get(`/plans/${id}`)
export const comparePlans = (planIds) => api.get("/plans/compare", {
    params: {planIds: planIds.join(',')}
})
export const getPriceHistory = (id) => api.get(`/plans/price-history/${id}`)
export const submitPlan = (data) => api.post("/plans/submit", data)