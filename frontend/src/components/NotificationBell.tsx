import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications, useReadAllNotifications } from '../hooks/useMutations'
import type { Notification } from '../types'

const BASE_TITLE = "it's an problem."

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

  // surface unread count in a background tab
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) ${BASE_TITLE}` : BASE_TITLE
    return () => { document.title = BASE_TITLE }
  }, [unreadCount])

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
                  <Link to={`/posts/${notification.post_id}`} onClick={() => setOpen(false)}>
                    {describe(notification)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
