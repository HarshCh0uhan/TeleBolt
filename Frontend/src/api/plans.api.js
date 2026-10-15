import api from "./axios";

export const getPlans = (filters) => api.get("/plans/", {params: filters})
export const getSinglePlan = (id) => api.get(`/plans/${id}`)
export const getPriceHistory = (id) => api.get(`/plans/price-history/${id}`)
export const submitPlan = (data) => api.post("/plans/submit", data)
export const getRankings = (params) => api.get("/plans/rankings", { params })
export const getRankingFormats = () => api.get("/plans/rankings/formats")
export const getPlanReviews = (planId) => api.get(`/plans/${planId}/reviews`)
export const createReview = (planId, data) => api.post(`/plans/${planId}/reviews`, data)
export const updateReview = (reviewId, data) => api.put(`/plans/reviews/${reviewId}`, data)
export const deleteReview = (reviewId) => api.delete(`/plans/reviews/${reviewId}`)