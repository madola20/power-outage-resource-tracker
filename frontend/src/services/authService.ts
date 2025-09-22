import axios from 'axios'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.state?.token) {
        config.headers.Authorization = `Token ${authData.state.token}`
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login/', credentials)
    return response.data
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout/')
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/accounts/profile/')
    return response.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.patch('/accounts/profile/', userData)
    return response.data
  },
}
