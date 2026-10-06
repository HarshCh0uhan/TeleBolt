import axios from "axios"

// Requests go to our own origin in production and Vercel rewrites /api/* through
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
    withCredentials: true
})

export default api
