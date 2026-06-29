// src/context/NotificationContext.jsx
// ============================================
// Contexte global des notifications
// Utilise l'API en temps réel pour le compteur
// Toujours exact — jamais de calcul local
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import notificationsService from '../services/notifications.service'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // --- Récupère le vrai compteur depuis l'API ---
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await notificationsService.getUnreadCount()
      // Ton API retourne { nonLues: 3 }
      setUnreadCount(data.nonLues ?? 0)
    } catch {
      // Silencieux
    }
  }, [isAuthenticated])

  // Chargement initial + rafraîchissement toutes les 15 secondes
  // 15s au lieu de 30s car l'API est temps réel
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchUnreadCount])

  // --- Après lecture → refresh immédiat depuis l'API ---
  // On ne calcule plus localement — l'API donne le vrai chiffre
  const refresh = useCallback(async () => {
    await fetchUnreadCount()
  }, [fetchUnreadCount])

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      refresh, // Appelé après markAsRead et markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications() doit être utilisé dans un NotificationProvider')
  }
  return context
}