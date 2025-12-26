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

    setTimeout(() => this.remove(id), notification.duration ?? 3000)
  },

  remove(id: number) {
    const index = this.list.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.list.splice(index, 1)
    }
  },

  success(message: string, duration?: number) {
    this.push({
      message,
      type: 'success',
      icon: '✔',
      duration,
    })
  },

  error(message: string, duration?: number) {
    this.push({
      message,
      type: 'error',
      icon: '❌',
      duration,
    })
  },

  info(message: string, duration: number = 12000) {
    this.push({
      message,
      type: 'info',
      icon: 'ℹ',
      duration,
    })
  },
})
