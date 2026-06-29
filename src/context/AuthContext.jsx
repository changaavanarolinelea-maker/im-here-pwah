// src/context/AuthContext.jsx
// ============================================
// Contexte d'authentification global
// Fournit à TOUTE l'application :
//   - l'utilisateur connecté (nom, rôle, email)
//   - les fonctions login / logout
//   - l'état de chargement initial
//
// Utilisation dans n'importe quel composant :
//   const { user, login, logout } = useAuth()
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/auth.service'

// --- Création du contexte ---
// On exporte AuthContext pour les cas avancés
// mais en général on utilise le hook useAuth()
const AuthContext = createContext(null)

// ============================================
// PROVIDER — Enveloppe toute l'application
// À placer dans main.jsx autour de <App />
// ============================================
export function AuthProvider({ children }) {
  // L'utilisateur connecté (null si non connecté)
  const [user, setUser] = useState(null)

  // true pendant qu'on vérifie si l'utilisateur est déjà connecté
  // Évite un flash de la page login avant de rediriger
  const [isLoading, setIsLoading] = useState(true)

  // ============================================
  // Au démarrage de l'app : vérifier si déjà connecté
  // Si un token existe dans localStorage, on restaure la session
  // ============================================
  useEffect(() => {
    const initAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          // Récupère l'utilisateur sauvegardé
          const savedUser = authService.getCurrentUser()
          setUser(savedUser)
        }
      } catch (error) {
        // Token corrompu ou invalide → on nettoie
        console.error('Erreur initialisation auth:', error)
        authService.logout()
      } finally {
        // Dans tous les cas, on arrête le chargement
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // ============================================
  // FONCTION LOGIN
  // Appelée depuis la page Login
  // Retourne mustChangePassword pour rediriger si besoin
  // ============================================
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    setUser(result.user)
    return result // contient { user, mustChangePassword }
  }, [])

  // ============================================
  // FONCTION LOGOUT
  // Appelée depuis le bouton déconnexion
  // Nettoie tout et redirige vers /login
  // ============================================
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  // ============================================
  // FONCTION UPDATE USER
  // Appelée après changement de mot de passe
  // ou modification du profil
  // ============================================
  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [user])

  // Valeurs exposées à toute l'application
  const value = {
    user,                          // { id, fullName, role, email }
    isLoading,                     // true pendant l'init
    isAuthenticated: !!user,       // boolean simple
    isAdmin: user?.role === 'admin', // true si admin
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// HOOK useAuth
// La façon propre d'accéder au contexte
// Usage : const { user, isAdmin } = useAuth()
// ============================================
export function useAuth() {
  const context = useContext(AuthContext)

  // Sécurité : si on utilise useAuth() hors du Provider
  if (!context) {
    throw new Error('useAuth() doit être utilisé dans un AuthProvider')
  }

  return context
}

export default AuthContext