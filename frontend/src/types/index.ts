export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'admin' | 'team_lead' | 'team_member' | 'reporter'
  role_display: string
  phone_number?: string
  is_active: boolean
  date_joined: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'cancelled'
  status_display: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  priority_display: string
  description?: string
  estimated_customers_affected?: number
  assigned_to?: User
  reported_by?: User
  reporter_email?: string
  reporter_phone?: string
  created_at: string
  updated_at: string
  reported_at: string
  estimated_restoration?: string
  actual_restoration?: string
  is_assigned: boolean
  is_resolved: boolean
  is_critical: boolean
}

export interface LocationUpdate {
  id: string
  location: Location
  updated_by: User
  update_type: 'status_change' | 'assignment' | 'priority_change' | 'general_update'
  update_type_display: string
  previous_status?: string
  new_status?: string
  notes: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  role: 'admin' | 'team_lead' | 'team_member' | 'reporter'
  password: string
  password_confirm: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PaginationParams {
  page?: number
  page_size?: number
}