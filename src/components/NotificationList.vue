<template>
  <div class="notification-container">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[`notification--${notification.type}`]"
      >
        <div class="notification__content">
          <v-icon
            :icon="getIcon(notification.type)"
            class="notification__icon"
          />
          <span class="notification__message">{{ notification.message }}</span>
        </div>
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          @click="remove(notification.id)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const { notifications, remove } = useNotification()

const getIcon = (type: string): string => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    default:
      return 'mdi-information'
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
  min-width: 300px;
}

.notification__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification__icon {
  flex-shrink: 0;
}

.notification__message {
  margin-right: 0.5rem;
  word-break: break-word;
}

.notification--success {
  background-color: #4caf50;
  color: white;
}

.notification--error {
  background-color: #f44336;
  color: white;
}

.notification--warning {
  background-color: #ff9800;
  color: white;
}

.notification--info {
  background-color: #2196f3;
  color: white;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
