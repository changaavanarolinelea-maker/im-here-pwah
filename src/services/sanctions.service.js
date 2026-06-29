// src/services/sanctions.service.js
// ============================================
// Gestion des sanctions
// Générées automatiquement par le backend
// Ne peuvent jamais être créées manuellement
// ============================================

import api from './api'

const sanctionsService = {

  // --- Mes sanctions (employé) ---
  // Filtres optionnels : month, year
  getMine: (filters = {}) => {
    const params = {}
    if (filters.month) params.month = filters.month
    if (filters.year)  params.year  = filters.year
    return api.get('/sanctions/me', { params }).then(r => r.data)
  },

  // --- Toutes les sanctions (admin) ---
  // Filtres : userId, month, year, type
  getAll: (filters = {}) => {
    const params = {}
    if (filters.userId) params.userId = filters.userId
    if (filters.month)  params.month  = filters.month
    if (filters.year)   params.year   = filters.year
    if (filters.type)   params.type   = filters.type
    return api.get('/sanctions/admin', { params }).then(r => r.data)
  },
}

export default sanctionsService