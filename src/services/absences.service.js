// src/services/absences.service.js
// ============================================
// Gestion des demandes d'absence
// ============================================

import api from './api'

const absencesService = {

  // --- Soumettre une demande ---
  create: (data) => {
    return api.post('/absences', data).then(r => r.data)
  },

  // --- Mes demandes ---
  getMine: () => {
    return api.get('/absences/me').then(r => r.data)
  },

  // --- Annuler une demande en attente ---
  cancel: (id) => {
    return api.delete(`/absences/${id}`).then(r => r.data)
  },

  // --- Toutes les demandes (admin) ---
  getAll: (filters = {}) => {
    return api.get('/absences/admin', { params: filters }).then(r => r.data)
  },

  // --- Approuver ou rejeter (admin) ---
  decide: (id, action, comment = '') => {
    return api.put(`/absences/admin/${id}/decision`, { action, comment }).then(r => r.data)
  },
}

export default absencesService