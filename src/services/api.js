// src/services/api.js
// ============================================
// Instance Axios centrale de l'application
// TOUT appel API passe par ici — jamais de fetch() direct
//
// Deux fonctionnalités clés :
// 1. Intercepteur REQUEST  → ajoute le token JWT automatiquement
// 2. Intercepteur RESPONSE → gère le refresh token si expiré
// ============================================

import axios from 'axios'

// URL de base de ton backend
// En développement : localhost:3000
// En production : remplace par l'URL réelle
const BASE_URL = 'http://localhost:3000'

// Création de l'instance Axios personnalisée
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// INTERCEPTEUR REQUEST
// S'exécute AVANT chaque requête envoyée
// Ajoute automatiquement le token JWT dans le header
// ============================================
api.interceptors.request.use(
  (config) => {
    // On lit le token stocké dans le navigateur
    const token = localStorage.getItem('accessToken')

    if (token) {
      // On l'ajoute dans le header Authorization
      // Le backend vérifie ce header à chaque requête protégée
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ============================================
// INTERCEPTEUR RESPONSE
// S'exécute APRÈS chaque réponse reçue
// Si le token est expiré (401), on en demande un nouveau
// automatiquement sans déconnecter l'utilisateur
// ============================================
api.interceptors.response.use(
  // Réponse OK → on la laisse passer sans modification
  (response) => response,

  // Réponse erreur → on analyse
  async (error) => {
    const originalRequest = error.config

    // Si erreur 401 (non autorisé) et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Évite une boucle infinie

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // Pas de refresh token → déconnexion forcée
          clearAuthTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Demande un nouveau accessToken avec le refreshToken
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Sauvegarde les nouveaux tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Relance la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Le refresh a échoué → déconnexion forcée
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================
// UTILITAIRE : Nettoyer les tokens
// Appelé à la déconnexion ou si le refresh échoue
// ============================================
export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export default api