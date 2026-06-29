// src/routes/ProtectedRoute.jsx
// ============================================
// Garde de route — vérifie que l'utilisateur
// est connecté avant d'afficher la page
//
// Si non connecté → redirige vers /login
// Si connecté → affiche la page demandée
// ============================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // Pendant la vérification du token au démarrage
  // on affiche un spinner plutôt que de rediriger trop vite
  if (isLoading) {
    return <Spinner fullScreen />
  }

  // Non connecté → retour au login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Connecté → affiche la page demandée
  return <Outlet />
}