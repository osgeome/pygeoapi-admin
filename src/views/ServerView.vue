<template>
  <div class="tw-p-6">
    <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Server Configuration</h1>

    <v-card>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent>
          <div class="tw-space-y-6">
            <!-- Server Settings -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Server Settings</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <!-- Bind Settings -->
                <v-text-field
                  v-model="formData.bind.host"
                  label="Bind Host"
                  hint="Server bind host (e.g., 0.0.0.0)"
                  persistent-hint
                  :rules="[(v) => !!v || 'Host is required']"
                />
                <v-text-field
                  v-model.number="formData.bind.port"
                  label="Bind Port"
                  type="number"
                  hint="Server bind port (e.g., 5000)"
                  persistent-hint
                  :rules="[
                    (v) => !!v || 'Port is required',
                    (v) => (v > 0 && v < 65536) || 'Port must be between 1 and 65535',
                  ]"
                />
                <v-text-field
                  v-model="formData.url"
                  label="Server URL"
                  hint="The base URL of your pygeoapi server"
                  persistent-hint
                  :rules="[(v) => !!v || 'Server URL is required']"
                />
                <v-text-field
                  v-model="formData.mimetype"
                  label="MIME Type"
                  hint="Default response MIME type"
                  persistent-hint
                  :rules="[(v) => !!v || 'MIME type is required']"
                />
                <v-text-field
                  v-model="formData.encoding"
                  label="Encoding"
                  hint="Default character encoding"
                  persistent-hint
                  :rules="[(v) => !!v || 'Encoding is required']"
                />
                <v-text-field
                  v-model="formData.language"
                  label="Language"
                  hint="Default language (e.g., en-US)"
                  persistent-hint
                  :rules="[(v) => !!v || 'Language is required']"
                />
              </div>
            </div>

            <!-- Server Features -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Features</h2>
              <div class="tw-grid md:tw-grid-cols-3 tw-gap-4">
                <v-switch
                  v-model="formData.cors"
                  label="Enable CORS"
                  color="primary"
                  hint="Cross-Origin Resource Sharing"
                  persistent-hint
                />
                <v-switch
                  v-model="formData.pretty_print"
                  label="Pretty Print"
                  color="primary"
                  hint="Format JSON responses"
                  persistent-hint
                />
                <v-switch
                  v-model="formData.gzip"
                  label="Enable GZIP"
                  color="primary"
                  hint="Response compression"
                  persistent-hint
                />
              </div>
            </div>

            <!-- Admin Settings -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Admin Settings</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-switch
                  v-model="formData.admin.enabled"
                  label="Enable Admin Interface"
                  color="primary"
                  hint="Enable administrative features"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.admin.username"
                  label="Admin Username"
                  hint="Administrative username"
                  persistent-hint
                  :disabled="!formData.admin.enabled"
                  :rules="[
                    (v) =>
                      !formData.admin.enabled ||
                      !!v ||
                      'Username is required when admin is enabled',
                  ]"
                />
                <v-text-field
                  v-model="formData.admin.password"
                  label="Admin Password"
                  type="password"
                  hint="Administrative password"
                  persistent-hint
                  :disabled="!formData.admin.enabled"
                  :rules="[
                    (v) =>
                      !formData.admin.enabled ||
                      !!v ||
                      'Password is required when admin is enabled',
                  ]"
                />
                <v-text-field
                  v-model="formData.admin.jwt.secret"
                  label="JWT Secret"
                  type="password"
                  hint="Secret key for JWT tokens"
                  persistent-hint
                  :disabled="!formData.admin.enabled"
                  :rules="[
                    (v) =>
                      !formData.admin.enabled ||
                      !!v ||
                      'JWT secret is required when admin is enabled',
                  ]"
                />
                <v-text-field
                  v-model.number="formData.admin.jwt.expiration"
                  label="JWT Expiration (hours)"
                  type="number"
                  hint="Token expiration time in hours"
                  persistent-hint
                  :disabled="!formData.admin.enabled"
                  :rules="[
                    (v) =>
                      !formData.admin.enabled ||
                      !!v ||
                      'JWT expiration is required when admin is enabled',
                    (v) => !formData.admin.enabled || v > 0 || 'Expiration must be greater than 0',
                  ]"
                />
              </div>
            </div>

            <!-- Logging Settings -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Logging Settings</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-select
                  v-model="formData.logging.level"
                  label="Log Level"
                  :items="['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']"
                  hint="Logging verbosity level"
                  persistent-hint
                  :rules="[(v) => !!v || 'Log level is required']"
                />
                <v-text-field
                  v-model="formData.logging.logfile"
                  label="Log File"
                  hint="Path to log file"
                  persistent-hint
                  :rules="[(v) => !!v || 'Log file path is required']"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="tw-flex tw-justify-between tw-gap-4 tw-mt-6">
            <div class="tw-flex tw-items-center tw-gap-2">
              <v-btn color="warning" :disabled="!hasChanges" @click="resetForm">
                Reset Changes
              </v-btn>
            </div>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!valid || !hasChanges"
              @click="saveConfig"
            >
              Save Changes
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import type { ServerConfig } from '@/types/config'
import { useNotification } from '@/composables/useNotification'

const configStore = useConfigStore()
const { success: showSuccess, error: showError } = useNotification()
const valid = ref(false)
const saving = ref(false)
const initialData = ref<ServerConfig | null>(null)

// Default server configuration structure derived from ServerConfig type
const formData = ref<ServerConfig>({
  bind: {
    host: '0.0.0.0',
    port: 5000,
  },
  url: 'http://localhost:5000',
  mimetype: 'application/json',
  encoding: 'utf-8',
  language: 'en-US',
  cors: true,
  pretty_print: true,
  gzip: false,
  admin: {
    enabled: false,
    username: '',
    password: '',
    jwt: {
      secret: '',
      expiration: 24,
    },
  },
  logging: {
    level: 'INFO',
    logfile: '/tmp/pygeoapi.log',
  },
})

const loadFormData = () => {
  if (!configStore.currentJson?.server) return

  // Deep clone to avoid reference issues
  initialData.value = JSON.parse(JSON.stringify(configStore.currentJson.server))

  // Ensure admin and jwt objects exist with default values
  const serverConfig = {
    ...initialData.value,
    admin: {
      enabled: false,
      username: '',
      password: '',
      jwt: {
        secret: '',
        expiration: 24,
      },
      ...initialData.value?.admin,
    },
  }

  Object.assign(formData.value, serverConfig)
}

const hasChanges = computed(() => {
  if (!initialData.value) return false
  return JSON.stringify(formData.value) !== JSON.stringify(initialData.value)
})

const resetForm = () => {
  if (initialData.value) {
    Object.assign(formData.value, initialData.value)
  }
}

const saveConfig = async () => {
  if (!valid.value) {
    showError('Please fix form validation errors')
    return
  }

  try {
    saving.value = true
    await configStore.updateServer(formData.value)
    showSuccess('Server configuration saved successfully')
  } catch (error) {
    showError('Failed to save server configuration')
  } finally {
    saving.value = false
  }
}

// Watch for store changes
watch(
  () => configStore.currentJson,
  () => {
    loadFormData()
  },
  { immediate: true },
)
</script>
