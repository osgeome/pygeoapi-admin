<template>
  <div class="tw-p-6">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-8">
      <div>
        <h1 class="tw-text-3xl tw-font-light tw-mb-2">Resources</h1>
        <p class="tw-text-gray-500 tw-text-sm">Manage your pygeoapi collections and processes</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="createNewResource"
        class="tw-rounded-lg"
      >
        Add Resource
      </v-btn>
    </div>

    <div v-if="loading" class="tw-min-h-[400px] tw-flex tw-justify-center tw-items-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div
      v-else-if="Object.keys(resources).length === 0"
      class="tw-min-h-[400px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-text-center"
    >
      <v-icon size="64" class="tw-mb-4 tw-text-gray-300">mdi-database-off-outline</v-icon>
      <h3 class="tw-text-xl tw-font-light tw-mb-2">No resources yet</h3>
      <p class="tw-text-gray-500 tw-text-sm tw-mb-6">Get started by adding your first resource</p>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="createNewResource"
        class="tw-rounded-lg"
      >
        Add Resource
      </v-btn>
    </div>

    <div v-else class="tw-grid sm:tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
      <v-card
        v-for="(resource, id) in resources"
        :key="id"
        class="tw-rounded-xl tw-overflow-hidden hover:tw-shadow-lg tw-transition-shadow"
        variant="flat"
      >
        <div class="tw-px-6 tw-pt-6 tw-pb-4">
          <!-- Resource Type & Actions -->
          <div class="tw-flex tw-justify-between tw-items-start tw-mb-4">
            <v-chip
              :color="getResourceTypeColor(resource?.type)"
              size="small"
              variant="flat"
              class="tw-font-medium"
            >
              {{ resource?.type || 'Unknown' }}
            </v-chip>

            <div class="tw-flex tw-gap-1">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                density="comfortable"
                size="small"
                :to="`/resources/${id}`"
                class="tw-text-gray-500 hover:tw-text-primary"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                density="comfortable"
                size="small"
                @click="confirmDelete(id)"
                class="tw-text-gray-500 hover:tw-text-error"
              />
            </div>
          </div>

          <!-- Resource ID & Provider -->
          <div class="tw-mb-4">
            <code
              class="tw-px-2 tw-py-1 tw-bg-gray-50 tw-rounded tw-text-sm tw-font-mono tw-text-gray-600"
              >{{ id }}</code
            >
            <div v-if="resource?.provider?.type" class="tw-mt-2">
              <span class="tw-text-sm tw-text-gray-500">Provider: </span>
              <span class="tw-text-sm tw-font-medium">{{ resource.provider.type }}</span>
            </div>
          </div>

          <!-- Title -->
          <div class="tw-mb-4">
            <h3 class="tw-font-medium tw-mb-2">{{ resource?.title?.en || 'Untitled' }}</h3>
            <v-btn
              v-if="Object.keys(resource?.title || {}).length > 1"
              variant="text"
              density="comfortable"
              size="small"
              class="tw-text-primary tw-px-0"
              prepend-icon="mdi-translate"
            >
              {{ Object.keys(resource?.title || {}).length }} translations
            </v-btn>
          </div>

          <!-- Keywords -->
          <div v-if="resource?.keywords?.en?.length" class="tw-flex tw-flex-wrap tw-gap-1">
            <v-chip
              v-for="keyword in resource.keywords.en"
              :key="keyword"
              size="x-small"
              variant="outlined"
              class="tw-text-gray-600"
            >
              {{ keyword }}
            </v-chip>
          </div>
        </div>

        <!-- Links -->
        <v-divider v-if="resource?.links?.length"></v-divider>

        <div v-if="resource?.links?.length" class="tw-px-4 tw-py-3 tw-bg-gray-50">
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <v-btn
              v-for="link in resource.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              variant="text"
              size="small"
              :prepend-icon="getLinkIcon(link.type)"
              class="tw-text-gray-600"
            >
              {{ link.rel }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card class="tw-rounded-lg">
        <v-card-title class="tw-text-xl tw-font-light">Delete Resource?</v-card-title>
        <v-card-text class="tw-text-gray-600">
          Are you sure you want to delete "{{ resourceToDelete }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="tw-p-4">
          <v-spacer></v-spacer>
          <v-btn color="gray" variant="text" @click="showDeleteDialog = false"> Cancel </v-btn>
          <v-btn color="error" variant="flat" @click="deleteResource"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'

const router = useRouter()
const configStore = useConfigStore()

const showDeleteDialog = ref(false)
const resourceToDelete = ref('')
const loading = ref(true)

const resources = computed(() => {
  return configStore.currentJson?.resources || {}
})

function getResourceTypeIcon(type: string | undefined) {
  switch (type?.toLowerCase()) {
    case 'collection':
      return 'mdi-database'
    case 'process':
      return 'mdi-cog'
    default:
      return 'mdi-help-circle'
  }
}

function getResourceTypeColor(type: string | undefined) {
  switch (type?.toLowerCase()) {
    case 'collection':
      return 'primary'
    case 'process':
      return 'success'
    default:
      return 'gray'
  }
}

function getLinkIcon(type: string) {
  if (type.includes('json')) return 'mdi-code-json'
  if (type.includes('xml')) return 'mdi-code-brackets'
  if (type.includes('csv')) return 'mdi-file-delimited'
  if (type.includes('html')) return 'mdi-language-html5'
  return 'mdi-link'
}

function createNewResource() {
  router.push('/resources/new')
}

function confirmDelete(id: string) {
  resourceToDelete.value = id
  showDeleteDialog.value = true
}

function deleteResource() {
  if (configStore.currentJson?.resources) {
    const newResources = { ...configStore.currentJson.resources }
    delete newResources[resourceToDelete.value]

    configStore.saveConfig({
      ...configStore.currentJson,
      resources: newResources,
    })
  }

  showDeleteDialog.value = false
  resourceToDelete.value = ''
}

onMounted(async () => {
  if (!configStore.currentJson) {
    await configStore.loadConfig()
  }
  loading.value = false
})
</script>
