<template>
  <div class="tw-p-6">
    <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Metadata Configuration</h1>
    
    <v-card>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent>
          <div class="tw-space-y-6">
            <!-- Identification -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Service Identification</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-model="formData.identification.title.en"
                  label="Title (English)"
                  hint="Name of the service"
                  persistent-hint
                  :rules="[(v) => !!v || 'Title is required']"
                />
                <v-textarea
                  v-model="formData.identification.description.en"
                  label="Description (English)"
                  hint="Brief description of the service"
                  persistent-hint
                  :rules="[(v) => !!v || 'Description is required']"
                  rows="2"
                  auto-grow
                />
                <v-combobox
                  v-model="formData.identification.keywords.en"
                  label="Keywords (English)"
                  hint="Keywords describing the service"
                  persistent-hint
                  multiple
                  chips
                  :rules="[(v) => v?.length > 0 || 'At least one keyword is required']"
                />
                <v-select
                  v-model="formData.identification.keywords_type"
                  label="Keywords Type"
                  :items="['discipline', 'temporal', 'place', 'theme', 'stratum']"
                  hint="Type of keywords"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.identification.terms_of_service.en"
                  label="Terms of Service (English)"
                  hint="Terms of service for using the API"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.identification.url"
                  label="URL"
                  hint="Service URL"
                  persistent-hint
                  :rules="[(v) => !!v || 'URL is required']"
                />
              </div>
            </div>

            <!-- License -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">License Information</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-model="formData.license.name.en"
                  label="License Name (English)"
                  hint="Name of the license"
                  persistent-hint
                  :rules="[(v) => !!v || 'License name is required']"
                />
                <v-text-field
                  v-model="formData.license.url.en"
                  label="License URL (English)"
                  hint="URL to the license text"
                  persistent-hint
                  :rules="[(v) => !!v || 'License URL is required']"
                />
              </div>
            </div>

            <!-- Provider -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Provider Information</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-model="formData.provider.name.en"
                  label="Provider Name (English)"
                  hint="Name of the service provider"
                  persistent-hint
                  :rules="[(v) => !!v || 'Provider name is required']"
                />
                <v-text-field
                  v-model="formData.provider.url.en"
                  label="Provider URL (English)"
                  hint="URL of the service provider"
                  persistent-hint
                  :rules="[(v) => !!v || 'Provider URL is required']"
                />
              </div>
            </div>

            <!-- Contact -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Contact Information</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-model="formData.contact.name"
                  label="Contact Name"
                  hint="Name of the contact person"
                  persistent-hint
                  :rules="[(v) => !!v || 'Contact name is required']"
                />
                <v-text-field
                  v-model="formData.contact.position"
                  label="Position"
                  hint="Position of the contact person"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.address"
                  label="Address"
                  hint="Postal address"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.city"
                  label="City"
                  hint="City name"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.stateorprovince"
                  label="State/Province"
                  hint="State or province"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.postalcode"
                  label="Postal Code"
                  hint="Postal or ZIP code"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.country"
                  label="Country"
                  hint="Country name"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.phone"
                  label="Phone"
                  hint="Phone number"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.fax"
                  label="Fax"
                  hint="Fax number"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.email"
                  label="Email"
                  hint="Email address"
                  persistent-hint
                  type="email"
                />
                <v-text-field
                  v-model="formData.contact.url"
                  label="URL"
                  hint="Contact URL"
                  persistent-hint
                />
                <v-text-field
                  v-model="formData.contact.hours"
                  label="Hours"
                  hint="Hours of service"
                  persistent-hint
                />
                <v-textarea
                  v-model="formData.contact.instructions"
                  label="Instructions"
                  hint="Contact instructions"
                  persistent-hint
                  rows="2"
                  auto-grow
                />
                <v-text-field
                  v-model="formData.contact.role"
                  label="Role"
                  hint="Contact role"
                  persistent-hint
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="tw-flex tw-justify-between tw-gap-4 tw-mt-6">
            <div class="tw-flex tw-items-center tw-gap-2">
              <v-btn
                color="warning"
                :disabled="!hasChanges"
                @click="resetForm"
              >
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
import type { MetadataConfig } from '@/types/config'
import { useNotification } from '@/composables/useNotification'

const configStore = useConfigStore()
const { success: showSuccess, error: showError } = useNotification()
const valid = ref(false)
const saving = ref(false)
const initialData = ref<MetadataConfig | null>(null)

// Default metadata form structure derived from MetadataConfig type
const formData = ref<MetadataConfig>({
  identification: {
    title: { en: '' },
    description: { en: '' },
    keywords: { en: [] },
    keywords_type: 'theme',
    terms_of_service: { en: '' },
    url: ''
  },
  license: {
    name: { en: '' },
    url: { en: '' }
  },
  provider: {
    name: { en: '' },
    url: { en: '' }
  },
  contact: {
    name: '',
    position: '',
    address: '',
    city: '',
    stateorprovince: '',
    postalcode: '',
    country: '',
    phone: '',
    fax: '',
    email: '',
    url: '',
    hours: '',
    instructions: '',
    role: ''
  }
})

const loadFormData = () => {
  if (!configStore.currentJson?.metadata) return
  
  // Deep clone to avoid reference issues
  initialData.value = JSON.parse(JSON.stringify(configStore.currentJson.metadata))
  Object.assign(formData.value, initialData.value)
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
    await configStore.updateMetadata(formData.value)
    showSuccess('Metadata configuration saved successfully')
  } catch (error) {
    showError('Failed to save metadata configuration')
  } finally {
    saving.value = false
  }
}

// Watch for store changes
watch(() => configStore.currentJson, () => {
  loadFormData()
}, { immediate: true })
</script>
