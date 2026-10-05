import api from "./axios"

export const register = (data) => api.post("/auth/register", data)
export const registerAdmin = (data) => api.post("/auth/register-admin", data)
export const login = (data) => api.post("/auth/login", data)
export const logout = () => api.post("/auth/logout")
export const updateProfile = (data) => api.patch("/auth/me", data)
export const getFavoritePlans = () => api.get("/auth/favorites")
export const toggleFavoritePlan = (planId) => api.post(`/auth/favorites/${planId}`)
export const removeFavoritePlan = (planId) => api.delete(`/auth/favorites/${planId}`)
