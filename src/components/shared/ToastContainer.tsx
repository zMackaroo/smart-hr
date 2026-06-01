import { CheckCircle2, X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../utils/cn'
import { useNotificationStore } from '../../store/notificationStore'

const AUTO_DISMISS_MS = 5000

export function ToastContainer() {
  const notifications = useNotificationStore((state) => state.notifications)
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  useEffect(() => {
    if (notifications.length === 0) return

    const timers = notifications.map((notification) =>
      window.setTimeout(() => removeNotification(notification.id), AUTO_DISMISS_MS),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-surface p-4 shadow-card',
            notification.type === 'success' && 'border-success/30',
            notification.type === 'error' && 'border-error/30',
            notification.type === 'warning' && 'border-warning/30',
            notification.type === 'info' && 'border-info/30',
          )}
        >
          {notification.type === 'success' && (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          )}
          <p className="flex-1 text-sm text-primary">{notification.message}</p>
          <button
            type="button"
            onClick={() => removeNotification(notification.id)}
            className="rounded p-1 text-secondary hover:text-primary"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
