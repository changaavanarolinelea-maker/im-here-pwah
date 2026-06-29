// src/routes/PublicRoute.jsx
// ============================================
// Route publique — redirige si déjà connecté
//
// Empêche un utilisateur déjà connecté
// de revoir la page login
// ============================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function PublicRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <Spinner fullScreen />
  }

  // Déjà connecté → redirige vers le bon espace
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/home'} replace />
  }

  // Non connecté → affiche la page publique (login)
  return <Outlet />
}