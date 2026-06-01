import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (type: NotificationType, message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

let notificationCounter = 0

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (type, message) => {
    const id = `notification-${++notificationCounter}`
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }))
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  clearNotifications: () => set({ notifications: [] }),
}))
