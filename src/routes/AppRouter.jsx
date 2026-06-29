// src/routes/AppRouter.jsx
// ============================================
// Routeur principal de l'application
// Définit toutes les pages et leur protection
//
// Structure :
// /login              → public (redirige si déjà connecté)
// /admin/*            → admin seulement
// /*                  → tout utilisateur connecté
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Gardes de routes
import PublicRoute  from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute   from './AdminRoute'

// Layout
import Layout from '../components/layout/Layout'

// Pages auth
import LoginPage          from '../pages/auth/LoginPage'
import ChangePasswordPage from '../pages/auth/ChangePasswordPage'

// Pages admin
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminUsersPage     from '../pages/admin/AdminUsersPage'
import AdminAbsencesPage  from '../pages/admin/AdminAbsencesPage'
import AdminSanctionsPage from '../pages/admin/AdminSanctionsPage'
import AdminQrCodePage    from '../pages/admin/AdminQrCodePage'
import AdminConfigPage    from '../pages/admin/AdminConfigPage'

// Pages utilisateur
import UserHomePage       from '../pages/user/UserHomePage'
import UserAttendancePage from '../pages/user/UserAttendancePage'
import UserAbsencesPage   from '../pages/user/UserAbsencesPage'
import NotificationsPage  from '../pages/user/NotificationsPage'
import ProfilePage        from '../pages/user/ProfilePage'
import UserSanctionsPage  from '../pages/user/UserSanctionsPage'
import ScanQrPage         from '../pages/user/ScanQrPage'

export default function   AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            ROUTES PUBLIQUES
            Accessibles sans connexion
            ============================== */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ==============================
            ROUTE CHANGEMENT MOT DE PASSE
            Connecté mais doit changer son mdp
            ============================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* ==============================
            ROUTES ADMIN
            Connecté + rôle admin requis
            ============================== */}
        <Route element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users"     element={<AdminUsersPage />}     />
            <Route path="/admin/absences"  element={<AdminAbsencesPage />}  />
            <Route path="/admin/sanctions" element={<AdminSanctionsPage />} />
            <Route path="/admin/qrcode"    element={<AdminQrCodePage />}    />
            <Route path="/admin/config"    element={<AdminConfigPage />}    />
          </Route>
        </Route>

        {/* ==============================
            ROUTES UTILISATEUR
            Connecté (tout rôle)
            ============================== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home"          element={<UserHomePage />}       />
            <Route path="/attendance"    element={<UserAttendancePage />} />
            <Route path="/absences"      element={<UserAbsencesPage />}   />
            <Route path="/notifications" element={<NotificationsPage />}  />
            <Route path="/profile"       element={<ProfilePage />} />
            <Route path="/sanctions"     element={<UserSanctionsPage />} />
            <Route path="/scan"          element={<ScanQrPage />} />
            <Route path="/notifications"   element={<NotificationsPage />}  />
          </Route>
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
