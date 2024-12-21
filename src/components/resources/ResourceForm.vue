<template>
  <v-form ref="form" @submit.prevent="save">
    <v-container>
      <!-- Basic Info -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="resource.name"
            label="Resource Name"
            :rules="[v => !!v || 'Name is required']"
            :disabled="isEdit"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="resource.type"
            label="Resource Type"
            :items="RESOURCE_TYPES"
            :rules="[v => !!v || 'Type is required']"
            required
          />
        </v-col>
      </v-row>

      <!-- Provider Configuration -->
      <v-card class="mb-4">
        <v-card-title>Provider Configuration</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="resource.provider.type"
                label="Provider Type"
                :items="PROVIDER_TYPES"
                :rules="[v => !!v || 'Provider type is required']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="resource.provider.name"
                label="Provider Name"
                :rules="[v => !!v || 'Provider name is required']"
                required
              />
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="resource.provider.data"
            label="Data Source"
            :rules="[v => !!v || 'Data source is required']"
            required
          />

          <!-- Provider Properties -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>Properties</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row v-for="(value, key) in resource.provider.properties" :key="key" class="mb-2">
                  <v-col cols="5">
                    <v-text-field
                      :model-value="key"
                      :label="formatPropertyKey(key)"
                      disabled
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="resource.provider.properties[key]"
                      :label="'Value'"
                    />
                  </v-col>
                  <v-col cols="1" class="d-flex align-center">
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      @click="removeProperty(key)"
                    />
                  </v-col>
                </v-row>

                <!-- Add New Property -->
                <v-row class="mt-2">
                  <v-col cols="5">
                    <v-text-field
                      v-model="newProperty.key"
                      label="Property Key"
                      placeholder="Enter property key"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="newProperty.value"
                      label="Property Value"
                      placeholder="Enter property value"
                    />
                  </v-col>
                  <v-col cols="1" class="d-flex align-center">
                    <v-btn
                      icon="mdi-plus"
                      color="primary"
                      variant="text"
                      :disabled="!newProperty.key"
                      @click="addProperty"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <!-- Languages and Translations -->
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          Languages and Translations
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                v-bind="props"
                prepend-icon="mdi-plus"
              >
                Add Language
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="lang in availableLanguages"
                :key="lang"
                :value="lang"
                @click="addLanguage(lang)"
              >
                <v-list-item-title>{{ lang.toUpperCase() }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>

        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="lang in resource.languages"
              :key="lang"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  {{ lang.toUpperCase() }}
                  <v-btn
                    v-if="lang !== 'en'"
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    color="error"
                    class="ml-2"
                    @click.stop="removeLanguage(lang)"
                  />
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-text-field
                  v-model="resource.titles[lang]"
                  :label="'Title'"
                  :rules="[v => !!v || 'Title is required']"
                  required
                />
                <v-textarea
                  v-model="resource.descriptions[lang]"
                  :label="'Description'"
                  :rules="[v => !!v || 'Description is required']"
                  required
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <v-row class="mt-4">
        <v-col class="d-flex justify-end">
          <v-btn
            color="error"
            class="mr-2"
            @click="$emit('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="save"
          >
            {{ isEdit ? 'Update' : 'Create' }} Resource
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Resource } from '@/types/resource'
import { DEFAULT_RESOURCE, DEFAULT_PROVIDER } from '@/types/resource'

const RESOURCE_TYPES = ['collection', 'stac-collection', 'process'] as const
const PROVIDER_TYPES = ['feature', 'coverage', 'record', 'tile', 'map'] as const
const AVAILABLE_LANGUAGES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'] as const

const props = defineProps<{
  modelValue: Resource
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Resource): void
  (e: 'save', resource: Resource): void
  (e: 'cancel'): void
}>()

const form = ref<any>(null)
const resource = reactive({ ...props.modelValue })
const newProperty = reactive({ key: '', value: '' })

// Computed properties
const availableLanguages = computed(() => 
  AVAILABLE_LANGUAGES.filter(lang => !resource.languages.includes(lang))
)

// Methods
const formatPropertyKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const addProperty = () => {
  if (!newProperty.key) return
  
  resource.provider.properties = {
    ...resource.provider.properties,
    [newProperty.key]: newProperty.value
  }
  
  newProperty.key = ''
  newProperty.value = ''
}

const removeProperty = (key: string) => {
  const { [key]: _, ...rest } = resource.provider.properties
  resource.provider.properties = rest
}

const addLanguage = (lang: string) => {
  if (!resource.languages.includes(lang)) {
    resource.languages.push(lang)
    resource.titles[lang] = ''
    resource.descriptions[lang] = ''
  }
}

const removeLanguage = (lang: string) => {
  if (lang === 'en') return // Prevent removing English
  
  const index = resource.languages.indexOf(lang)
  if (index > -1) {
    resource.languages.splice(index, 1)
    delete resource.titles[lang]
    delete resource.descriptions[lang]
  }
}

const save = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) return
  
  emit('save', { ...resource })
}

// Initialize form
if (!resource.provider) {
  resource.provider = { ...DEFAULT_PROVIDER }
}

defineExpose({ form })
</script>

<style scoped>
.v-card {
  margin-bottom: 1rem;
}

.v-expansion-panels {
  margin-top: 1rem;
}
</style>
