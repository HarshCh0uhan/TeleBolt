import api from "./axios"

export const register = (data) => api.post("/auth/register", data)
export const registerAdmin = (data) => api.post("/auth/register-admin", data)
export const login = (data) => api.post("/auth/login", data)
export const logout = () => api.post("/auth/logout")