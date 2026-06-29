// src/utils/formatters.js
// ============================================
// Fonctions de formatage réutilisables
// Dates, heures, statuts, noms...
// On utilise date-fns pour les dates (léger et fiable)
// ============================================

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// ============================================
// DATES
// ============================================

// Formate une date en "12 janvier 2025"
export const formatDate = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'd MMMM yyyy', { locale: fr })
  } catch {
    return '—'
  }
}

// Formate une date en "12/01/2025"
export const formatDateShort = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd/MM/yyyy', { locale: fr })
  } catch {
    return '—'
  }
}

// Formate une heure en "08h30"
export const formatTime = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, "HH'h'mm", { locale: fr })
  } catch {
    return '—'
  }
}

// Formate en "Aujourd'hui", "Hier", ou "12 jan."
export const formatRelativeDay = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isToday(d)) return "Aujourd'hui"
    if (isYesterday(d)) return 'Hier'
    return format(d, 'd MMM', { locale: fr })
  } catch {
    return '—'
  }
}

// "il y a 5 minutes", "il y a 2 heures"
export const formatTimeAgo = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: fr })
  } catch {
    return '—'
  }
}

// ============================================
// STATUTS DE PRÉSENCE
// Convertit les codes API en texte lisible + couleur
// ============================================

// Retourne { label, color, bg } selon le statut
export const getAttendanceStatus = (status) => {
  const statuses = {
    present:  { label: 'Présent',    color: 'text-status-present', bg: 'bg-green-50',        dot: 'bg-status-present' },
    absent:   { label: 'Absent',     color: 'text-status-absent',  bg: 'bg-red-50',           dot: 'bg-status-absent'  },
    late:     { label: 'En retard',  color: 'text-status-late',    bg: 'bg-amber-50',         dot: 'bg-status-late'    },
    early:    { label: 'Parti tôt',  color: 'text-brand-gray',     bg: 'bg-brand-light',      dot: 'bg-brand-gray'     },
    pending:  { label: 'En attente', color: 'text-status-pending', bg: 'bg-blue-50',          dot: 'bg-status-pending' },
  }
  return statuses[status] ?? { label: status ?? '—', color: 'text-brand-gray', bg: 'bg-brand-light', dot: 'bg-brand-gray' }
}

// Retourne { label, color, bg } selon le statut d'absence
export const getAbsenceStatus = (status) => {
  const statuses = {
    pending:  { label: 'En attente', color: 'text-status-pending', bg: 'bg-blue-50'  },
    approved: { label: 'Approuvée',  color: 'text-status-present', bg: 'bg-green-50' },
    rejected: { label: 'Rejetée',    color: 'text-status-absent',  bg: 'bg-red-50'   },
  }
  return statuses[status] ?? { label: status ?? '—', color: 'text-brand-gray', bg: 'bg-brand-light' }
}

// ============================================
// NOMS ET TEXTES
// ============================================

// "Jean Dupont" → "JD" (pour les avatars)
export const getInitials = (fullName) => {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Capitalise la première lettre
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Rôle en français
export const formatRole = (role) => {
  const roles = {
    admin: 'Administrateur',
    user:  'Employé',
  }
  return roles[role] ?? role
}