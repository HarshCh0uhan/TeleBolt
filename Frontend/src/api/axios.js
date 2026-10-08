import axios from "axios"

// Requests go to our own origin in production and Vercel rewrites /api/*
// to the Render backend. That keeps the auth cookie first-party: talking to
// onrender.com directly would make it a third-party cookie, which Safari,
// Firefox and Chrome's tracking protection all block, so logins would silently
// fail for many visitors. VITE_API_URL still overrides this for a deliberate
// direct connection; VITE_DEPLOY_URL is no longer used.
const baseURL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? import.meta.env.VITE_LOCALHOST_URL : "/api")

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
        if (duration > 5000) {
            console.warn(`Slow API: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
        }
        return response
    },
    (error) => {
        // Don't show toast for cancelled requests
        if (axios.isCancel(error)) {
            return Promise.reject(error)
        }

        // Network error / timeout
        if (!error.response) {
            const message = error.code === "ECONNABORTED"
                ? "Request timed out. Please try again."
                : "Network error. Please check your connection."
            console.error("API Network Error:", error.message)
            return Promise.reject(new Error(message))
        }

        // HTTP errors with structured response
        const { status, data } = error.response
        let message = "An unexpected error occurred"

        switch (status) {
            case 400:
                message = typeof data === "string" ? data : "Invalid request. Please check your input."
                break
            case 401:
                message = "Session expired. Please log in again."
                // Redirect to login if not already there
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login"
                }
                break
            case 403:
                message = "You don't have permission to perform this action."
                break
            case 404:
                message = "The requested resource was not found."
                break
            case 422:
                message = typeof data === "string" ? data : "Validation failed. Please check your input."
                break
            case 429:
                message = "Too many requests. Please wait a moment and try again."
                break
            case 500:
                message = "Server error. Please try again later."
                break
            case 503:
                message = "Service temporarily unavailable. Please try again later."
                break
            default:
                message = typeof data === "string" ? data : `Error ${status}: Something went wrong`
        }

        console.error(`API Error (${status}):`, error.config?.url, message)
        return Promise.reject(new Error(message))
    }
)

export default api