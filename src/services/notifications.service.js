// src/services/notifications.service.js
// ============================================
// Gestion des notifications utilisateur
// ============================================

import api from './api'

const notificationsService = {

  // --- Toutes mes notifications ---
  getAll: () => {
    return api.get('/notifications').then(r => r.data)
  },

  // --- Nombre de non lues (pour le badge) ---
  getUnreadCount: () => {
    return api.get('/notifications/unread-count').then(r => r.data)
  },

  // --- Marquer une notification comme lue ---
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`).then(r => r.data)
  },

  // --- Tout marquer comme lu ---
  markAllAsRead: () => {
    return api.put('/notifications/read-all').then(r => r.data)
  },
}

export default notificationsService