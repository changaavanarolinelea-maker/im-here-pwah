// src/services/users.service.js
// ============================================
// Gestion des utilisateurs — routes admin uniquement
// ============================================

import api from './api'

const usersService = {

  // --- Statistiques du jour ---
  getStats: (date) => {
    const params = date ? { date } : {}
    return api.get('/admin/users/stats', { params }).then(r => r.data)
  },

  // --- Liste des utilisateurs ---
  getAll: (filters = {}) => {
    return api.get('/admin/users', { params: filters }).then(r => r.data)
  },

  // --- Un seul utilisateur ---
  getById: (id) => {
    return api.get(`/admin/users/${id}`).then(r => r.data)
  },

  // --- Créer un utilisateur ---
  create: (data) => {
    return api.post('/admin/users', data).then(r => r.data)
  },

  // --- Modifier un utilisateur ---
  update: (id, data) => {
    return api.put(`/admin/users/${id}`, data).then(r => r.data)
  },

  // --- Désactiver (soft delete) ---
  deactivate: (id) => {
    return api.delete(`/admin/users/${id}`).then(r => r.data)
  },

  // --- Supprimer définitivement ---
  deletePermanent: (id) => {
    return api.delete(`/admin/users/${id}/permanent`).then(r => r.data)
  },

  // --- Révoquer l'appareil ---
  revokeDevice: (id) => {
    return api.put(`/admin/users/${id}/device`).then(r => r.data)
  },

  // --- Réinitialiser le mot de passe ---
  resetPassword: (id) => {
    return api.put(`/admin/users/${id}/password`).then(r => r.data)
  },
}

export default usersService