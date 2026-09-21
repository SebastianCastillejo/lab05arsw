import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Token vencido o inválido: se borra y se avisa a la app para cerrar la sesión
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  },
)

export default api
