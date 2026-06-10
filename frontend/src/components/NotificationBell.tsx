import { useState } from 'react'
import { useNotifications, useReadAllNotifications } from '../hooks/useMutations'
import type { Notification } from '../types'

function describe(notification: Notification) {
  if (notification.event === 'helpful_mark') {
    return `Your reply on “${notification.post_title}” was marked helpful`
  }
  return `Someone replied to “${notification.post_title}”`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data } = useNotifications()
  const readAll = useReadAllNotifications()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unread_count ?? 0

  function toggle() {
    const opening = !open
    setOpen(opening)
    if (opening && unreadCount > 0) {
      readAll.mutate()
    }
  }

  return (
    <div className="notification-bell">
      <button
        className="logout-icon-btn"
        onClick={toggle}
        title="Notifications"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <img src="/assets/icons/bell.svg" alt="" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p className="notification-empty">Nothing yet. Replies to your posts land here.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className={notification.read ? '' : 'is-unread'}>
                  {describe(notification)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
