<template>
  <div class="tw-p-6">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
      <div>
        <h1 class="tw-text-2xl tw-font-bold">
          {{ isNew ? 'New Resource' : `Edit ${resourceId}` }}
        </h1>
        <p class="tw-text-gray-600">Configure your PyGeoAPI resource</p>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent>
          <div class="tw-space-y-6">
            <!-- Basic Information -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Basic Information</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-text-field
                  v-if="isNew"
                  v-model="formData.id"
                  label="Resource ID"
                  hint="Unique identifier for this resource"
                  persistent-hint
                  :rules="[
                    v => !!v || 'ID is required',
                    v => !existingResources.includes(v) || 'ID already exists'
                  ]"
                />
                <v-select
                  v-model="formData.type"
                  label="Type"
                  :items="['collection', 'process']"
                  hint="Resource type"
                  persistent-hint
                  :rules="[v => !!v || 'Type is required']"
                />
              </div>
            </div>

            <!-- Multilingual Fields -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Multilingual Information</h2>
              
              <!-- Title -->
              <div class="tw-mb-6">
                <h3 class="tw-font-medium tw-mb-2">Title</h3>
                <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                  <v-text-field
                    v-for="lang in languages"
                    :key="'title-' + lang"
                    v-model="formData.title[lang]"
                    :label="'Title (' + lang + ')'"
                    :hint="'Title in ' + lang"
                    persistent-hint
                    :rules="[v => !!v || 'Title is required']"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="tw-mb-6">
                <h3 class="tw-font-medium tw-mb-2">Description</h3>
                <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                  <v-text-field
                    v-for="lang in languages"
                    :key="'desc-' + lang"
                    v-model="formData.description[lang]"
                    :label="'Description (' + lang + ')'"
                    :hint="'Description in ' + lang"
                    persistent-hint
                  />
                </div>
              </div>

              <!-- Keywords -->
              <div class="tw-mb-6">
                <h3 class="tw-font-medium tw-mb-2">Keywords</h3>
                <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                  <div v-for="lang in languages" :key="'keywords-' + lang" class="tw-space-y-2">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span class="tw-text-sm tw-font-medium">{{ lang }}</span>
                      <v-btn
                        size="small"
                        density="compact"
                        variant="text"
                        @click="addKeyword(lang)"
                        prepend-icon="mdi-plus"
                      >
                        Add Keyword
                      </v-btn>
                    </div>
                    <v-chip-group column>
                      <v-chip
                        v-for="(keyword, index) in formData.keywords[lang]"
                        :key="lang + '-' + index"
                        closable
                        @click:close="removeKeyword(lang, index)"
                      >
                        {{ keyword }}
                      </v-chip>
                    </v-chip-group>
                    <v-text-field
                      v-model="newKeywords[lang]"
                      :label="'New keyword in ' + lang"
                      density="compact"
                      hide-details
                      @keyup.enter="addKeyword(lang)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Provider Settings -->
            <div>
              <h2 class="tw-text-lg tw-font-semibold tw-mb-4">Provider Settings</h2>
              <div class="tw-grid md:tw-grid-cols-2 tw-gap-4">
                <v-select
                  v-model="formData.providers[0].type"
                  label="Provider Type"
                  :items="providerTypes"
                  hint="Data provider type"
                  persistent-hint
                  :rules="[v => !!v || 'Provider type is required']"
                />
                <v-text-field
                  v-model="formData.providers[0].name"
                  label="Provider Name"
                  hint="Name of the provider"
                  persistent-hint
                  :rules="[v => !!v || 'Provider name is required']"
                />
                <v-text-field
                  v-model="formData.providers[0].data"
                  label="Data Source"
                  hint="Path or connection string to data"
                  persistent-hint
                  :rules="[v => !!v || 'Data source is required']"
                />
              </div>
            </div>

            <!-- Advanced Configuration -->
            <div v-if="showAdvancedConfig">
              <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h2 class="tw-text-lg tw-font-semibold">Advanced Configuration</h2>
                <v-btn-group>
                  <v-btn
                    :color="format === 'yaml' ? 'primary' : undefined"
                    :variant="format === 'yaml' ? 'flat' : 'text'"
                    size="small"
                    density="comfortable"
                    @click="format = 'yaml'"
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
                    @click="format = 'json'"
                    :disabled="format === 'json'"
                    class="tw-font-mono"
                    prepend-icon="mdi-code-json"
                  >
                    JSON
                  </v-btn>
                </v-btn-group>
              </div>
              <div class="tw-h-96">
                <VueMonacoEditor
                  v-model:value="editorContent"
                  :language="format"
                  theme="vs-dark"
                  :options="editorOptions"
                  @change="handleEditorChange"
                  class="tw-h-full tw-rounded-lg tw-overflow-hidden tw-shadow-sm"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="tw-flex tw-justify-between tw-gap-4 tw-mt-6">
            <div class="tw-flex tw-items-center tw-gap-2">
              <v-switch
                v-model="showAdvancedConfig"
                label="Show Advanced Configuration"
                hide-details
              />
            </div>
            <div class="tw-flex tw-gap-2">
              <v-btn
                variant="tonal"
                color="error"
                @click="router.push('/resources')"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!valid"
                @click="saveResource"
              >
                Save Resource
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import * as YAML from 'yaml'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const resourceId = computed(() => route.params.id as string)
const isNew = computed(() => resourceId.value === 'new')

const valid = ref(false)
const showAdvancedConfig = ref(false)
const format = ref<'yaml' | 'json'>('yaml')
const editorContent = ref('')

// Supported languages
const languages = ['en', 'ar', 'bs', 'de', 'es', 'fr', 'sr']

// New keywords input state
const newKeywords = ref(Object.fromEntries(languages.map(lang => [lang, ''])))

const providerTypes = [
  'feature',
  'coverage',
  'tile',
  'process',
  'stac',
  'record',
  'collection'
]

const formData = ref({
  id: '',
  type: 'collection',
  title: Object.fromEntries(languages.map(lang => [lang, ''])),
  description: Object.fromEntries(languages.map(lang => [lang, ''])),
  keywords: Object.fromEntries(languages.map(lang => [lang, [] as string[]])),
  providers: [{
    type: '',
    name: '',
    data: ''
  }]
})

const editorOptions = {
  minimap: { enabled: false },
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  fontSize: 14,
  automaticLayout: true
}

const existingResources = computed(() => {
  return Object.keys(configStore.currentJson?.resources || {})
})

function addKeyword(lang: string) {
  if (newKeywords.value[lang]?.trim()) {
    formData.value.keywords[lang].push(newKeywords.value[lang].trim())
    newKeywords.value[lang] = ''
  }
}

function removeKeyword(lang: string, index: number) {
  formData.value.keywords[lang].splice(index, 1)
}

function handleEditorChange(value: string) {
  try {
    const parsed = format.value === 'yaml' ? YAML.parse(value) : JSON.parse(value)
    // Only update if the parsed content is valid
    if (parsed && typeof parsed === 'object') {
      // Preserve the ID
      const id = formData.value.id
      Object.assign(formData.value, parsed)
      if (isNew.value) {
        formData.value.id = id
      }
    }
  } catch (error) {
    console.error('Invalid format:', error)
  }
}

function updateEditorContent() {
  const content = {
    ...formData.value,
    id: undefined // Remove id from the content
  }
  
  editorContent.value = format.value === 'yaml' 
    ? YAML.stringify(content)
    : JSON.stringify(content, null, 2)
}

function loadResource() {
  if (!isNew.value && configStore.currentJson?.resources) {
    const resource = configStore.currentJson.resources[resourceId.value]
    if (resource) {
      // Initialize with default empty values for all supported languages
      const defaultMultiLang = Object.fromEntries(languages.map(lang => [lang, '']))
      const defaultKeywords = Object.fromEntries(languages.map(lang => [lang, [] as string[]]))

      formData.value = {
        id: resourceId.value,
        type: resource.type || 'collection',
        title: { ...defaultMultiLang, ...resource.title },
        description: { ...defaultMultiLang, ...resource.description },
        keywords: { ...defaultKeywords, ...resource.keywords },
        providers: resource.providers || [{
          type: '',
          name: '',
          data: ''
        }]
      }
      updateEditorContent()
    }
  }
}

function saveResource() {
  if (!configStore.currentJson) return

  const resourceData = {
    type: formData.value.type,
    title: formData.value.title,
    description: formData.value.description,
    keywords: formData.value.keywords,
    providers: formData.value.providers
  }

  const newResources = {
    ...configStore.currentJson.resources,
    [isNew.value ? formData.value.id : resourceId.value]: resourceData
  }

  configStore.saveConfig({
    ...configStore.currentJson,
    resources: newResources
  })

  router.push('/resources')
}

// Watch for format changes
watch(format, () => {
  updateEditorContent()
})

// Watch for form data changes
watch(formData, () => {
  updateEditorContent()
}, { deep: true })

onMounted(() => {
  loadResource()
})

// Watch for store changes
watch(() => configStore.currentJson, () => {
  loadResource()
}, { immediate: true })
</script>
