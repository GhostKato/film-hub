import { reactive } from 'vue'

type NotificationItem = {
  message: string
  type: 'success' | 'error' | 'info'
  icon?: string
  duration?: number
}

export const notificationStore = reactive({
  list: [] as Array<NotificationItem & { id: number }>,

  push(notification: NotificationItem) {
    const id = Date.now()
    this.list.push({ id, ...notification })

    setTimeout(() => this.remove(id), notification.duration || 3500)
  },

  remove(id: number) {
    this.list = this.list.filter((n) => n.id !== id)
  },

  success(message: string) {
    this.push({
      message,
      type: 'success',
      icon: '✔',
    })
  },

  error(message: string) {
    this.push({
      message,
      type: 'error',
      icon: '⛔',
    })
  },

  info(message: string) {
    this.push({
      message,
      type: 'info',
      icon: 'ℹ',
    })
  },
})
