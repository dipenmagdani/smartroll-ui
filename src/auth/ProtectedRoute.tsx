// src/components/common/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import { PAGE_LOGIN } from '@constants'

interface ProtectedRouteProps {
  children: React.ReactElement // This is the content that will be protected
  roleRequired?: string // Optional: you can specify which role is required
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roleRequired }) => {
  const { role, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div> // Show a loading state until role is determined
  }

  // Redirect to login if no role or invalid role
  if (!role) {
    return <Navigate to={PAGE_LOGIN.path} replace />
  }

  // Optionally check for specific roles if roleRequired is provided
  if (roleRequired && role !== roleRequired) {
    return <Navigate to={PAGE_LOGIN.path} replace />
  }

  return children // Render the protected content
}

export default ProtectedRoute
