// src/services/auth.service.js
// ============================================
// Toutes les fonctions liées à l'authentification
// Login, logout, refresh, changement de mot de passe
// ============================================

import api, { clearAuthTokens } from './api'

const authService = {

  // --- Connexion ---
  // Envoie email + password, reçoit les tokens et les sauvegarde
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user, mustChangePassword } = response.data

    // Sauvegarde dans le navigateur (persiste si on ferme l'onglet)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    return { user, mustChangePassword }
  },

  // --- Déconnexion ---
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      // On nettoie toujours, même si l'appel échoue
      clearAuthTokens()
    }
  },

  // --- Changer son propre mot de passe ---
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  // --- Récupérer l'utilisateur depuis le localStorage ---
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // --- Vérifier si l'utilisateur est connecté ---
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  // --- Vérifier si l'utilisateur est admin ---
  isAdmin: () => {
    const user = authService.getCurrentUser()
    return user?.role === 'admin'
  },
}

export default authService