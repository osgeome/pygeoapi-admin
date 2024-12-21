import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/server',
      name: 'server',
      component: () => import('@/views/ServerView.vue'),
    },
    {
      path: '/logging',
      name: 'logging',
      component: () => import('@/views/LoggingView.vue'),
    },
    {
      path: '/metadata',
      name: 'metadata',
      component: () => import('@/views/MetadataView.vue'),
    },
    {
      path: '/resources',
      name: 'resources',
      component: () => import('@/views/ResourcesListView.vue'),
    },
    {
      path: '/resources/:id',
      name: 'resource-edit',
      component: () => import('@/views/ResourceEditView.vue'),
    },
    {
      path: '/advanced-edit',
      name: 'advanced-edit',
      component: () => import('@/views/AdvancedEditView.vue'),
    },
  ],
})

export default router
