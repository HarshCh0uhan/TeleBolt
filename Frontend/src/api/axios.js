import axios from "axios"

const api = axios.create({
    baseURL: location.hostname === "localhost" ? import.meta.env.VITE_LOCALHOST_URL : import.meta.env.VITE_DEPLOY_URL,
    withCredentials: true
})

export default api