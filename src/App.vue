<template>
  <v-app>
    <Sidebar />

    <v-main class="tw-bg-gray-50">
      <router-view></router-view>
    </v-main>

    <NotificationList />
    <FloatingActionButton />
  </v-app>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import NotificationList from '@/components/NotificationList.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'
</script>
