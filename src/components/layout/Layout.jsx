// src/components/layout/Layout.jsx
// ============================================
// Structure principale de toutes les pages
// Combine Sidebar + Header + contenu de la page
//
// Sur desktop : sidebar fixe à gauche + contenu à droite
// Sur mobile  : sidebar en overlay + header avec hamburger
// ============================================

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

// Titres des pages selon la route active
const PAGE_TITLES = {
  '/admin/dashboard':      'Dashboard',
  '/admin/users':          'Gestion des employés',
  '/admin/absences':       'Gestion des absences',
  '/admin/sanctions':      'Sanctions & logs',
  '/admin/qrcode':         'QR Code de pointage',
  '/admin/config':         'Configuration système',
  '/home':                 'Accueil',
  '/attendance':           'Mes présences',
  '/absences':             'Mes absences',
  '/notifications':        'Notifications',
  '/profile':              'Mon profil',
  '/sanctions':            'Mes sanctions',
  
}

export default function Layout() {
  const location = useLocation()

  // Contrôle l'ouverture/fermeture du menu sur mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const pageTitle = PAGE_TITLES[location.pathname] ?? "I'm Here"

  return (
    <div className="flex h-screen bg-brand-light overflow-hidden">

      {/* ==============================
          SIDEBAR DESKTOP
          Toujours visible sur lg+
          ============================== */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ==============================
          SIDEBAR MOBILE (overlay)
          S'ouvre par-dessus le contenu
          ============================== */}
      {isSidebarOpen && (
        <>
          {/* Fond sombre derrière la sidebar */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sidebar qui glisse depuis la gauche */}
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden animate-slide-in">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ==============================
          CONTENU PRINCIPAL
          Header + page courante
          ============================== */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header sticky en haut */}
        <Header
          title={pageTitle}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        {/* Zone de contenu scrollable */}
       {/* Zone de contenu scrollable — safe area pour iPhone */}
       <main className="flex-1 overflow-y-auto p-4 lg:p-6 safe-bottom">
         <Outlet />
       </main>
      </div>
    </div>
  )
}