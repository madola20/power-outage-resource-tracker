import axios from 'axios'
import { Location, LocationUpdate, User, PaginatedResponse, PaginationParams } from '../types'

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

export const locationService = {
  async getLocations(params?: PaginationParams): Promise<PaginatedResponse<Location>> {
    const response = await api.get('/locations/', { params })
    return response.data
  },

  async getAllLocations(): Promise<Location[]> {
    const response = await api.get('/locations/all/')
    return response.data
  },

  async getLocation(id: string): Promise<Location> {
    const response = await api.get(`/locations/${id}/`)
    return response.data
  },

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    const response = await api.post('/locations/', locationData)
    return response.data
  },

  async updateLocation(id: string, locationData: Partial<Location>): Promise<Location> {
    const response = await api.patch(`/locations/${id}/`, locationData)
    return response.data
  },

  async deleteLocation(id: string): Promise<void> {
    await api.delete(`/locations/${id}/`)
  },

  async assignLocation(locationId: string, userId: string): Promise<Location> {
    const response = await api.post(`/locations/assign/${locationId}/`, {
      user_id: userId,
    })
    return response.data
  },

  async updateLocationStatus(locationId: string, status: string, notes?: string): Promise<Location> {
    const response = await api.post(`/locations/${locationId}/update_status/`, {
      status,
      notes,
    })
    return response.data
  },

  async getLocationUpdates(locationId: string, params?: PaginationParams): Promise<PaginatedResponse<LocationUpdate>> {
    const response = await api.get(`/locations/${locationId}/updates/`, { params })
    return response.data
  },

  async createLocationUpdate(locationId: string, updateData: Partial<LocationUpdate>): Promise<LocationUpdate> {
    const response = await api.post(`/locations/${locationId}/updates/`, updateData)
    return response.data
  },
}

export const userService = {
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await api.get('/accounts/users/', { params })
    return response.data
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/accounts/users/${id}/`)
    return response.data
  },
}
