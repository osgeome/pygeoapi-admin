<template>
  <div class="floating-action-button">
    <v-speed-dial
      v-model="fab"
      direction="top"
      transition="slide-y-reverse-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          color="primary"
          icon
        >
          <v-icon>{{ fab ? 'mdi-close' : 'mdi-menu' }}</v-icon>
        </v-btn>
      </template>

      <!-- YAML Operations -->
      <v-btn
        color="green"
        icon
        size="small"
        @click="triggerFileImport"
        :key="'import'"
      >
        <v-icon>mdi-file-upload</v-icon>
        <v-tooltip activator="parent" location="left">
          Import YAML/JSON
        </v-tooltip>
      </v-btn>

      <v-btn
        color="green"
        icon
        size="small"
        @click="exportConfig"
        :key="'export'"
      >
        <v-icon>mdi-file-download</v-icon>
        <v-tooltip activator="parent" location="left">
          Export Configuration
        </v-tooltip>
      </v-btn>

      <!-- API Operations -->
      <v-btn
        color="indigo"
        icon
        size="small"
        @click="importFromApi"
        :key="'api-import'"
      >
        <v-icon>mdi-cloud-download</v-icon>
        <v-tooltip activator="parent" location="left">
          Import from REST API
        </v-tooltip>
      </v-btn>

      <v-btn
        color="indigo"
        icon
        size="small"
        @click="submitToApi"
        :key="'api-submit'"
      >
        <v-icon>mdi-cloud-upload</v-icon>
        <v-tooltip activator="parent" location="left">
          Submit to REST API
        </v-tooltip>
      </v-btn>
    </v-speed-dial>

    <!-- Hidden file input for YAML/JSON import -->
    <input
      type="file"
      ref="fileInput"
      accept=".yaml,.yml,.json"
      class="tw-hidden"
      @change="handleFileImport"
    >

    <!-- Export Format Dialog -->
    <v-dialog v-model="showExportDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Export Configuration
        </v-card-title>
        <v-card-text>
          <v-radio-group v-model="exportFormat" class="mt-2">
            <v-radio value="yaml" label="YAML format (.yaml)"></v-radio>
            <v-radio value="json" label="JSON format (.json)"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showExportDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="performExport"
            :loading="loading"
          >
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ confirmDialogTitle }}
        </v-card-title>
        <v-card-text>
          {{ confirmDialogMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmApiAction"
            :loading="loading"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

// State
const fab = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const showConfirmDialog = ref(false)
const showExportDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const pendingAction = ref<(() => void) | null>(null)
const exportFormat = ref('yaml')

// File Import/Export
const triggerFileImport = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    const file = input.files[0]
    const content = await file.text()
    const fileExt = file.name.split('.').pop()?.toLowerCase()

    if (fileExt === 'json') {
      await configStore.importJSON(content)
    } else if (fileExt === 'yaml' || fileExt === 'yml') {
      await configStore.importYAML(content)
    }
    
    fab.value = false
  } catch (error) {
    console.error('Error importing file:', error)
  } finally {
    input.value = '' // Reset input
  }
}

const exportConfig = () => {
  showExportDialog.value = true
  fab.value = false
}

const performExport = () => {
  try {
    let content: string
    let filename: string
    let mimeType: string

    if (exportFormat.value === 'json') {
      content = JSON.stringify(configStore.currentJson, null, 2)
      filename = 'pygeoapi-config.json'
      mimeType = 'application/json'
    } else {
      content = configStore.currentYaml
      filename = 'pygeoapi-config.yaml'
      mimeType = 'text/yaml'
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showExportDialog.value = false
  } catch (error) {
    console.error('Error exporting configuration:', error)
  }
}

// API Operations
const importFromApi = () => {
  confirmDialogTitle.value = 'Import from API'
  confirmDialogMessage.value = 'This will overwrite your current configuration. Are you sure?'
  pendingAction.value = async () => {
    try {
      loading.value = true
      // TODO: Get API URL from user input or configuration
      const apiUrl = 'http://localhost:5000' // Default URL, should be configurable
      await configStore.importFromAPI(apiUrl)
      showConfirmDialog.value = false
      fab.value = false
    } catch (error) {
      console.error('Error importing from API:', error)
    } finally {
      loading.value = false
    }
  }
  showConfirmDialog.value = true
}

const submitToApi = () => {
  confirmDialogTitle.value = 'Submit to API'
  confirmDialogMessage.value = 'This will update the server configuration. Are you sure?'
  pendingAction.value = async () => {
    try {
      loading.value = true
      // TODO: Get API URL from user input or configuration
      const apiUrl = 'http://localhost:5000' // Default URL, should be configurable
      await configStore.saveToAPI(apiUrl)
      showConfirmDialog.value = false
      fab.value = false
    } catch (error) {
      console.error('Error submitting to API:', error)
    } finally {
      loading.value = false
    }
  }
  showConfirmDialog.value = true
}

const confirmApiAction = () => {
  if (pendingAction.value) {
    pendingAction.value()
  }
}
</script>

<style scoped>
.floating-action-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}

@media (max-width: 600px) {
  .floating-action-button {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
