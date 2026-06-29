// src/routes/AdminRoute.jsx
// ============================================
// Garde de route admin — vérifie que l'utilisateur
// est connecté ET qu'il a le rôle "admin"
//
// Si non admin → redirige vers /home (espace employé)
// ============================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <Spinner fullScreen />
  }

  // Non connecté → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Connecté mais pas admin → espace employé
  if (!isAdmin) {
    return <Navigate to="/home" replace />
  }

  // Admin confirmé → affiche la page
  return <Outlet />
}