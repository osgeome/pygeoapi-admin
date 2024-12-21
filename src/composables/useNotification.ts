import { ref } from 'vue'

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

const notifications = ref<Notification[]>([])
let nextId = 1

export function useNotification() {
  const show = (message: string, type: Notification['type'] = 'info', timeout = 3000) => {
    const id = nextId++
    const notification: Notification = {
      id,
      message,
      type,
      timeout,
    }
    notifications.value.push(notification)

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }

    return id
  }

  const remove = (id: number) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, timeout = 5000) => show(message, 'success', timeout)
  const error = (message: string, timeout = 8000) => show(message, 'error', timeout)
  const info = (message: string, timeout = 5000) => show(message, 'info', timeout)
  const warning = (message: string, timeout = 6000) => show(message, 'warning', timeout)

  return {
    notifications,
    show,
    remove,
    success,
    error,
    info,
    warning,
  }
}
