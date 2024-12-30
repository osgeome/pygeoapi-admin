<template>
  <div class="tw-p-6">
    <div class="tw-mb-6">
      <h1 class="tw-text-2xl tw-font-semibold">pygeoapi Configuration Dashboard</h1>
      <p class="tw-text-gray-600">Manage your pygeoapi configuration</p>
    </div>

    <!-- Configuration Overview -->
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
      <!-- Server Info -->
      <v-card class="dashboard-card">
        <v-card-title class="tw-flex tw-items-center tw-gap-2">
          <v-icon>mdi-server</v-icon>
          Server Configuration
        </v-card-title>
        <v-card-text>
          <div class="tw-space-y-2">
            <div>
              <span class="tw-font-medium">URL:</span>
              <span class="tw-ml-2">{{ serverUrl }}</span>
            </div>
            <div>
              <span class="tw-font-medium">Resources:</span>
              <span class="tw-ml-2">{{ resourceCount }}</span>
            </div>
            <div class="tw-mt-4">
              <v-btn
                block
                color="primary"
                variant="tonal"
                to="/resources"
                prepend-icon="mdi-folder"
              >
                Manage Resources
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Version History -->
      <v-card class="dashboard-card">
        <v-card-title class="tw-flex tw-items-center tw-gap-2">
          <v-icon>mdi-history</v-icon>
          Version History
        </v-card-title>
        <v-card-text>
          <div class="tw-space-y-2">
            <div>
              <span class="tw-font-medium">Total Versions:</span>
              <span class="tw-ml-2">{{ versionCount }}</span>
            </div>
            <div>
              <span class="tw-font-medium">Last Modified:</span>
              <span class="tw-ml-2">{{ lastModified }}</span>
            </div>
            <div class="tw-mt-4">
              <v-btn
                block
                color="primary"
                variant="tonal"
                to="/advanced-edit"
                prepend-icon="mdi-pencil"
              >
                Open Editor
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Quick Actions -->
      <v-card class="dashboard-card">
        <v-card-title class="tw-flex tw-items-center tw-gap-2">
          <v-icon>mdi-lightning-bolt</v-icon>
          Quick Actions
        </v-card-title>
        <v-card-text>
          <div class="tw-space-y-4">
            <v-btn block :loading="syncing" prepend-icon="mdi-sync" @click="syncWithServer">
              Sync with Server
            </v-btn>
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="mdi-download"
              @click="exportConfig"
            >
              Export Configuration
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import type { PyGeoApiConfig } from '@/types/config'

const configStore = useConfigStore()
const syncing = ref(false)

// Computed properties
const serverUrl = computed(() => configStore.currentJson?.server?.url || 'Not configured')
const resourceCount = computed(() => Object.keys(configStore.currentJson?.resources || {}).length)
const versionCount = computed(() => configStore.history.length)
const lastModified = computed(() => {
  const lastVersion = configStore.history[0]
  return lastVersion ? new Date(lastVersion.timestamp).toLocaleString() : 'Never'
})

// Methods
const syncWithServer = async () => {
  try {
    syncing.value = true
    // TODO: Implement server sync logic
    // You can use the PyGeoApiConfig type for type safety when implementing sync
  } finally {
    syncing.value = false
  }
}

const exportConfig = async () => {
  try {
    const yamlContent = await configStore.exportYAML()
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pygeoapi-config.yaml'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting configuration:', error)
  }
}

// Initialize
onMounted(async () => {
  if (!configStore.currentJson) {
    await configStore.loadConfig()
  }
})
</script>

<style scoped>
.dashboard-card {
  transition: transform 0.2s;
}
.dashboard-card:hover {
  transform: translateY(-2px);
}
</style>
