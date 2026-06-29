// src/components/layout/Sidebar.jsx
// ============================================
// Navigation latérale
// Badge notifications sur le lien Notifs
// Adapté au rôle admin / user
// ============================================

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import Logo from '../shared/Logo'
import {
  LayoutDashboard, Users, CalendarOff, AlertTriangle,
  Settings, QrCode, Home, Clock, Umbrella, Bell, LogOut
} from 'lucide-react'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',     label: 'Employés',     icon: Users           },
  { to: '/admin/absences',  label: 'Absences',     icon: CalendarOff     },
  { to: '/admin/sanctions', label: 'Sanctions',    icon: AlertTriangle   },
  { to: '/admin/qrcode',    label: 'QR Code',      icon: QrCode          },
  { to: '/admin/config',    label: 'Paramètres',   icon: Settings        },
  { to: '/notifications',   label: 'Notifications', icon: Bell, hasNotif: true },
]

const USER_LINKS = [
  { to: '/home',          label: 'Accueil',        icon: Home            },
  { to: '/attendance',    label: 'Présences',      icon: Clock           },
  { to: '/absences',      label: 'Absences',       icon: Umbrella        },
  { to: '/sanctions',     label: 'Sanctions',      icon: AlertTriangle   },
  { to: '/notifications', label: 'Notifications',  icon: Bell, hasNotif: true },
]

export default function Sidebar({ onClose }) {
  const { user, isAdmin, logout } = useAuth()
  const { unreadCount }           = useNotifications()

  const links = isAdmin ? ADMIN_LINKS : USER_LINKS

  const getLinkClass = ({ isActive }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
    transition-all duration-200
    ${isActive
      ? 'bg-brand-red text-white'
      : 'text-brand-gray hover:bg-white hover:bg-opacity-10 hover:text-white'
    }
  `

  return (
    <aside className="flex flex-col h-full bg-brand-black w-64 p-4">

      {/* Logo */}
      <div className="mb-8 mt-2 px-1">
        <Logo size="sm" variant="full" />
      </div>

      {/* Rôle + nom */}
      <div className="mb-4 px-3 py-2 bg-white bg-opacity-5 rounded-lg">
        <p className="text-xs text-brand-gray uppercase tracking-widest mb-0.5">
          {isAdmin ? 'Administration' : 'Espace employé'}
        </p>
        <p className="text-sm font-medium text-white truncate">
          {user?.fullName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon, hasNotif }) => (
          <NavLink
            key={to}
            to={to}
            className={getLinkClass}
            onClick={onClose}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>

            {/* Badge notifications sur le lien Notifs */}
            {hasNotif && unreadCount > 0 && (
              <span className="
                min-w-[18px] h-[18px] px-1
                bg-brand-red text-white
                text-[10px] font-bold rounded-full
                flex items-center justify-center
                ring-1 ring-white ring-opacity-30
              ">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <button
        onClick={logout}
        className="
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-sm font-medium text-brand-gray
          hover:bg-white hover:bg-opacity-10 hover:text-white
          transition-all duration-200 mt-2
        "
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  )
}