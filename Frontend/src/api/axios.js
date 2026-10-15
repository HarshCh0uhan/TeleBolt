import axios from "axios"

// Requests go to our own origin in production and Vercel rewrites /api/*
// to the Render backend. That keeps the auth cookie first-party: talking to
// onrender.com directly would make it a third-party cookie, which Safari,
// Firefox and Chrome's tracking protection all block, so logins would silently
// fail for many visitors. VITE_API_URL still overrides this for a deliberate
// direct connection.
const baseURL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? import.meta.env.VITE_LOCALHOST_URL : "/api")

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
})

api.interceptors.request.use(
    (config) => {
        config.metadata = { startTime: Date.now() }
        return config
    },
    (error) => Promise.reject(error)
)

const DEFAULT_MESSAGES = {
    400: "Invalid request. Please check your input.",
    401: "Session expired. Please log in again.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
}

// The backend answers with a plain string, or { message } / { error } objects.
const messageFromBody = (data) => {
    if (typeof data === "string" && data.trim()) return data
    if (data && typeof data === "object") {
        if (typeof data.message === "string" && data.message.trim()) return data.message
        if (typeof data.error === "string" && data.error.trim()) return data.error
    }
    return null
}

// This interceptor normalises error messages and must NOT navigate. Redirecting
// on 401 would bounce guests off public pages, because every visitor triggers an
// initial /auth/me check. ProtectedRoute handles unauthenticated access.
// The original axios error is kept (not replaced) so `error.response` survives.
api.interceptors.response.use(
    (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
        if (duration > 5000) {
            console.warn(`Slow API: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
        }
        return response
    },
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error)

        if (!error.response) {
            const friendly = new Error(
                error.code === "ECONNABORTED"
                    ? "Request timed out. Please try again."
                    : "Network error. Please check your connection."
            )
            friendly.code = error.code
            friendly.config = error.config
            friendly.isNetworkError = true
            console.error("API Network Error:", error.message)
            return Promise.reject(friendly)
        }

        const { status, data } = error.response
        const message =
            messageFromBody(data) || DEFAULT_MESSAGES[status] || `Error ${status}: Something went wrong`

        if (status !== 401) console.error(`API Error (${status}):`, error.config?.url, message)

        error.message = message
        return Promise.reject(error)
    }
)

export default api