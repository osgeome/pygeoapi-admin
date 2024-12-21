<template>
  <div class="tw-flex tw-flex-col tw-h-full tw-bg-gray-50">
    <!-- Format Selection and Actions -->
    <div class="tw-flex tw-flex-col tw-gap-2 tw-p-4 tw-pb-2">
      <!-- Top Bar -->
      <div class="tw-flex tw-justify-between tw-items-center tw-bg-white tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200">
        <!-- Left side: Format buttons -->
        <div class="tw-flex tw-items-center tw-gap-2 tw-p-2">
          <v-btn-group>
            <v-btn
              :color="format === 'yaml' ? 'primary' : undefined"
              :variant="format === 'yaml' ? 'flat' : 'text'"
              size="small"
              density="comfortable"
              @click="switchFormat('yaml')"
              :disabled="format === 'yaml'"
              class="tw-font-mono"
              prepend-icon="mdi-code-brackets"
            >
              YAML
            </v-btn>
            <v-btn
              :color="format === 'json' ? 'primary' : undefined"
              :variant="format === 'json' ? 'flat' : 'text'"
              size="small"
              density="comfortable"
              @click="switchFormat('json')"
              :disabled="format === 'json'"
              class="tw-font-mono"
              prepend-icon="mdi-code-json"
            >
              JSON
            </v-btn>
          </v-btn-group>
        </div>

        <!-- Right side: Actions -->
        <div class="tw-flex tw-items-center tw-gap-2 tw-p-2">
          <v-btn
            color="primary"
            size="small"
            density="comfortable"
            @click="saveVersion"
            :loading="saving"
            :disabled="!hasUnsavedChanges"
            prepend-icon="mdi-content-save"
          >
            Save Version
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            density="comfortable"
            @click="showHistory = true"
            prepend-icon="mdi-history"
          >
            History
          </v-btn>
        </div>
      </div>

      <!-- Unsaved Changes Indicator -->
      <div v-if="hasUnsavedChanges" class="tw-flex tw-items-center tw-gap-2">
        <v-chip
          color="warning"
          size="small"
          variant="flat"
          class="tw-font-mono"
          prepend-icon="mdi-alert"
        >
          Unsaved Changes
        </v-chip>
      </div>
    </div>

    <!-- Editor Container -->
    <div class="tw-flex-1 tw-relative tw-px-4 tw-pb-4">
      <VueMonacoEditor
        v-model:value="editorContent"
        :language="format"
        theme="vs-dark"
        :options="editorOptions"
        @change="handleEditorChange"
        @mount="handleEditorMount"
        class="tw-h-full tw-rounded-lg tw-overflow-hidden tw-shadow-sm"
      />
    </div>

    <!-- Version History Drawer -->
    <v-navigation-drawer v-model="showHistory" location="right" temporary width="400">
      <v-list>
        <v-list-subheader>Version History</v-list-subheader>
        <v-list-item
          v-for="version in configHistory"
          :key="version.id"
          @click="loadVersion(version)"
          :active="currentVersionId === version.id"
        >
          <template v-slot:prepend>
            <v-icon :color="currentVersionId === version.id ? 'primary' : undefined">
              {{ currentVersionId === version.id ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
          </template>
          <v-list-item-title>Version {{ version.id }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(version.timestamp) }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Notifications -->
    <v-snackbar v-model="showNotification" :color="notificationColor" :timeout="3000">
      {{ notificationText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { useConfigStore } from '@/stores/configStore'
import { useCodeEditor } from '@/composables/useCodeEditor'
import { useNotification } from '@/composables/useNotification'

// Store
const configStore = useConfigStore()
const { success, error: showError } = useNotification()

// Editor setup
const {
  format,
  editorContent,
  editorOptions,
  hasUnsavedChanges,
  handleEditorMount,
  handleEditorChange,
  switchFormat,
  setContent,
  getCurrentContent
} = useCodeEditor('yaml')

// State
const saving = ref(false)
const showHistory = ref(false)
const currentVersionId = ref<number | null>(null)
const showNotification = ref(false)
const notificationText = ref('')
const notificationColor = ref('success')

// Computed
const configHistory = computed(() => configStore.history)

// Methods
const saveVersion = async () => {
  try {
    saving.value = true
    const { content, format: currentFormat } = getCurrentContent()
    const version = await configStore.saveVersion(content, currentFormat)
    currentVersionId.value = version.id
    success('Version saved successfully')
  } catch (err) {
    console.error('Error saving version:', err)
    showError('Error saving version')
  } finally {
    saving.value = false
  }
}

const loadVersion = (version: any) => {
  const content = format.value === 'yaml' ? version.yamlContent : version.jsonContent
  setContent(content, format.value)
  currentVersionId.value = version.id
  showHistory.value = false
  success(`Loaded version ${version.id}`)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Watch for store changes (e.g., from file import)
watch(() => configStore.currentYaml, (newYaml) => {
  if (format.value === 'yaml' && newYaml) {
    nextTick(() => {
      setContent(newYaml, 'yaml')
      success('Configuration imported successfully')
    })
  }
})

watch(() => configStore.currentJson, (newJson) => {
  if (format.value === 'json' && newJson) {
    nextTick(() => {
      const content = JSON.stringify(newJson, null, 2)
      setContent(content, 'json')
      success('Configuration imported successfully')
    })
  }
})

// Initialize
onMounted(async () => {
  try {
    await configStore.loadConfig()
    const content = format.value === 'yaml' 
      ? configStore.currentYaml 
      : JSON.stringify(configStore.currentJson, null, 2)
      
    if (content) {
      nextTick(() => {
        setContent(content, format.value)
      })
    }
    
    if (configStore.history.length > 0) {
      currentVersionId.value = configStore.history[0].id
    }
  } catch (err) {
    console.error('Error loading initial config:', err)
    showError('Error loading configuration')
  }
})
</script>
