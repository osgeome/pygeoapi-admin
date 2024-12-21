<template>
  <div class="tw-p-6">
    <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Logging Configuration</h1>

    <v-card>
      <v-card-text>
        <v-form v-model="valid">
          <div class="tw-space-y-6">
            <!-- Logging Level -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Logging Level</h2>
              <v-select
                v-model="config.level"
                :items="logLevels"
                label="Log Level"
                hint="Minimum level of messages to log"
                persistent-hint
              />
            </div>

            <!-- Output Configuration -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Output Configuration</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-model="config.logfile"
                  label="Log File"
                  hint="Path to the log file"
                  persistent-hint
                />
                <v-select
                  v-model="config.format"
                  :items="logFormats"
                  label="Log Format"
                  hint="Format of log messages"
                  persistent-hint
                />
              </div>
            </div>

            <!-- Debug Mode -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Debug Settings</h2>
              <v-switch
                v-model="config.debug"
                label="Debug Mode"
                color="primary"
                hint="Enable detailed debug logging"
                persistent-hint
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="tw-flex tw-justify-end tw-gap-4 tw-mt-6">
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!valid || saving"
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
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useNotification } from '@/composables/useNotification'

const configStore = useConfigStore()
const { success, error } = useNotification()

const valid = ref(true)
const saving = ref(false)

const logLevels = ['ERROR', 'WARNING', 'INFO', 'DEBUG']
const logFormats = ['%(asctime)s - %(name)s - %(levelname)s - %(message)s']

const config = computed(() => {
  const loggingConfig = configStore.currentJson?.logging || {}
  return {
    level: loggingConfig.level || 'ERROR',
    logfile: loggingConfig.logfile || '/tmp/pygeoapi.log',
    format: loggingConfig.format || '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    debug: loggingConfig.debug ?? false,
  }
})

const saveConfig = async () => {
  try {
    saving.value = true
    const updatedConfig = {
      ...configStore.currentJson,
      logging: { ...config.value }
    }
    await configStore.saveConfig(updatedConfig)
    success('Logging configuration saved successfully')
  } catch (err) {
    console.error('Error saving logging config:', err)
    error('Failed to save logging configuration')
  } finally {
    saving.value = false
  }
}
</script>
