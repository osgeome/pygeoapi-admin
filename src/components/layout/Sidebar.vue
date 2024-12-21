<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="expandIfCollapsed">
    <v-list-item prepend-avatar="./pygeoapi-icon-notrans.png" :title="rail ? '' : 'pygeoapi-admin'">
      <template v-slot:append>
        <v-btn variant="text" icon="mdi-chevron-left" @click.stop="toggleCollapse"></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :value="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="rail ? '' : item.title"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const drawer = ref(true)
const rail = ref(false)
const mobile = ref(false)

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/',
  },
  {
    title: 'Server',
    icon: 'mdi-server',
    to: '/server',
  },
  {
    title: 'Logging',
    icon: 'mdi-text-box-search',
    to: '/logging',
  },
  {
    title: 'Metadata',
    icon: 'mdi-information',
    to: '/metadata',
  },
  {
    title: 'Resources',
    icon: 'mdi-folder',
    to: '/resources',
  },
  {
    title: 'Advanced Edit',
    icon: 'mdi-pencil',
    to: '/advanced-edit',
  },
]

const toggleCollapse = () => {
  rail.value = !rail.value
}

const expandIfCollapsed = () => {
  if (rail.value) {
    rail.value = false
  }
}

const checkMobile = () => {
  mobile.value = window.innerWidth < 960
  if (mobile.value) {
    rail.value = false
    drawer.value = false
  } else {
    drawer.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Expose these for potential parent component use
defineExpose({
  drawer,
  rail,
  mobile,
})
</script>
