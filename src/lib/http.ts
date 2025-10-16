import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL as string | undefined
export const isInMemory = !API_URL
export const http = axios.create({
  baseURL: API_URL ?? 'http://localhost:0000',
  withCredentials: false
})

// (opcional) token:
// http.interceptors.request.use(cfg => {
//   const t = localStorage.getItem('token')
//   if (t) cfg.headers.Authorization = `Bearer ${t}`
//   return cfg
// })
