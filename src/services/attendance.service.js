// src/services/attendance.service.js
// ============================================
// Gestion de la présence — pointage et historique
// ============================================

import api from './api'

const attendanceService = {

  // --- QR Code actuel (public) ---
  getCurrentQrCode: () => {
    return api.get('/attendance/qrcode/current').then(r => r.data)
  },

  // --- Check-in (arrivée) ---
  checkIn: (token, deviceId) => {
    return api.post('/attendance/checkin', { token, deviceId }).then(r => r.data)
  },

  // --- Check-out (départ) ---
  checkOut: (token, deviceId) => {
    return api.post('/attendance/checkout', { token, deviceId }).then(r => r.data)
  },

  // --- Signal de présence ---
  sendSignal: (deviceId) => {
    return api.post('/attendance/signal', { deviceId }).then(r => r.data)
  },

  // --- Mon historique de présence ---
  getMyAttendance: (filters = {}) => {
    return api.get('/attendance/me', { params: filters }).then(r => r.data)
  },

  // --- Logs admin ---
  getAdminLogs: (filters = {}) => {
    return api.get('/sanctions/admin/attendance', { params: filters }).then(r => r.data)
  },

  // --- Logs d'un utilisateur spécifique (admin) ---
  getUserLogs: (userId, filters = {}) => {
    return api.get(`/sanctions/admin/attendance/${userId}`, { params: filters }).then(r => r.data)
  },
}

export default attendanceService