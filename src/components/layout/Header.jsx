// src/components/layout/Header.jsx
// ============================================
// Barre supérieure de chaque page
// Badge notifications branché sur NotificationContext
// — se met à jour en temps réel toutes les 15s
// ============================================

import { useNavigate } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getInitials } from '../../utils/formatters'

export default function Header({ title, onMenuToggle }) {
  const { user }        = useAuth()
  const { unreadCount } = useNotifications() // ← branché sur le contexte global
  const navigate        = useNavigate()

  return (
    <header className="
      sticky top-0 z-30 safe-top
      bg-white border-b border-brand-border
      px-4 py-3
      flex items-center justify-between gap-4
    ">
      {/* Gauche : hamburger + titre */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="
            lg:hidden p-2 rounded-lg
            text-brand-gray hover:bg-brand-light
            transition-colors duration-200
          "
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-brand-dark truncate">
          {title}
        </h1>
      </div>

      {/* Droite : notifications + avatar */}
      <div className="flex items-center gap-2">

        {/* Cloche — même route pour admin et user */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-brand-gray hover:bg-brand-light transition-colors duration-200"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        >
          <Bell size={20} />

          {/* Badge — visible seulement si > 0 */}
          {unreadCount > 0 && (
            <span className="
              absolute -top-0.5 -right-0.5
              min-w-[18px] h-[18px] px-1
              bg-brand-red text-white
              text-[10px] font-bold rounded-full
              flex items-center justify-center
              ring-2 ring-white
            ">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="
            w-8 h-8 rounded-full
            bg-brand-black text-white
            text-xs font-bold
            flex items-center justify-center
            hover:bg-brand-dark transition-colors duration-200
            shrink-0
          "
          aria-label="Mon profil"
        >
          {getInitials(user?.fullName)}
        </button>
      </div>
    </header>
  )
}