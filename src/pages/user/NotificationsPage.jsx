// src/pages/user/NotificationsPage.jsx
// ============================================
// Centre de notifications
// Après chaque action → refresh API immédiat
// Badge toujours synchronisé avec le serveur
// ============================================

import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import notificationsService from '../../services/notifications.service'
import { useNotifications } from '../../context/NotificationContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { formatTimeAgo } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isMarkingAll, setIsMarkingAll]   = useState(false)

  // refresh → rappelle GET /notifications/unread-count
  const { refresh } = useNotifications()

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await notificationsService.getAll()
      setNotifications(data.notifications ?? [])
    } catch {
      toast.error('Impossible de charger les notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  // --- Marquer une comme lue → refresh badge API ---
  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id)
      // Mise à jour locale de la liste
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
      // Refresh du badge depuis l'API — chiffre exact
      await refresh()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  // --- Tout marquer lu → refresh badge API ---
  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      // Refresh du badge — doit retourner 0
      await refresh()
      toast.success('Toutes les notifications ont été lues')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-gray">
          {unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Tout est à jour'
          }
        </p>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            isLoading={isMarkingAll}
          >
            <CheckCheck size={14} />
            Tout marquer lu
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-8">
            <Bell size={32} className="text-brand-border" />
            <p className="text-sm text-brand-gray">Aucune notification</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-brand-border">
            {notifications.map(notif => (
              <NotificationRow
                key={notif._id}
                notification={notif}
                onRead={() => handleMarkAsRead(notif._id)}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function NotificationRow({ notification, onRead }) {
  return (
    <li
      onClick={() => !notification.isRead && onRead()}
      className={`
        flex items-start gap-3 px-4 py-3
        transition-colors duration-150 cursor-pointer
        ${notification.isRead
          ? 'hover:bg-brand-light'
          : 'bg-brand-red-light hover:bg-red-100'
        }
      `}
    >
      <div className="mt-1.5 flex-shrink-0">
        <div className={`
          w-2 h-2 rounded-full
          ${notification.isRead ? 'bg-transparent' : 'bg-brand-red'}
        `} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm leading-relaxed
          ${notification.isRead
            ? 'text-brand-gray font-normal'
            : 'text-brand-dark font-medium'
          }
        `}>
          {notification.message ?? 'Nouvelle notification'}
        </p>
        <p className="text-xs text-brand-gray mt-0.5">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </li>
  )
}