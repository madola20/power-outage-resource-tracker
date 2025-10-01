import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LocationList from './pages/LocationList'
import LocationDetail from './pages/LocationDetail'
import LocationForm from './pages/LocationForm'
import LocationEditForm from './pages/LocationEditForm'
import Profile from './pages/Profile'

function App() {
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/locations" element={<LocationList />} />
        <Route path="/location/new" element={<LocationForm />} />
        <Route path="/location/:id/edit" element={<LocationEditForm />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
