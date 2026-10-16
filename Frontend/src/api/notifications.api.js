import api from "./axios";

export const getMyNotifications = (params) => api.get("/notifications", { params })
export const getUnreadCount = () => api.get("/notifications/unread-count")
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.post("/notifications/read-all")
export const dismissNotification = (id) => api.delete(`/notifications/${id}`)

export const getMyAlerts = () => api.get("/alerts")
export const getAlertForPlan = (planId) => api.get(`/alerts/${planId}`)
export const toggleAlert = (planId) => api.post(`/alerts/${planId}`)
export const removeAlert = (planId) => api.delete(`/alerts/${planId}`)
