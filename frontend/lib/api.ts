import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Only clear tokens and redirect if this is not a login attempt
      if (!error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        // Instead of forcing redirect, dispatch a custom event
        // Let the app handle auth failures gracefully
        window.dispatchEvent(new CustomEvent('auth-error'))
      }
    }
    return Promise.reject(error)
  },
)

export default api
