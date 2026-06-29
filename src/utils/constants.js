// src/utils/constants.js
// ============================================
// Constantes globales de l'application
// Centralise toutes les valeurs fixes
// ============================================

// Rôles utilisateur
export const ROLES = {
  ADMIN: 'admin',
  USER:  'user',
}

// Statuts de présence
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT:  'absent',
  LATE:    'late',
  EARLY:   'early',
}

// Statuts d'absence
export const ABSENCE_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// Clés localStorage (évite les fautes de frappe)
export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER:          'user',
}

// Pagination par défaut
export const DEFAULT_PAGE_SIZE = 10

// Durée du QR code en secondes (à ajuster selon ton backend)
export const QR_REFRESH_INTERVAL = 5