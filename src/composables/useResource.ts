import { ref } from 'vue'
import type { Resource } from '@/types/resource'
import { DEFAULT_RESOURCE } from '@/types/resource'
import { useConfigStore } from '@/stores/configStore'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

export function useResource() {
  const configStore = useConfigStore()
  const { config } = storeToRefs(configStore)
  const { error: showError, success: showSuccess } = useNotification()
  
  const resourceForm = ref<Resource>({ ...DEFAULT_RESOURCE })
  const isLoading = ref(false)
  const isEdit = ref(false)

  const loadResource = async (name: string) => {
    try {
      isLoading.value = true
      isEdit.value = true

      const resource = config.value.resources?.[name]
      if (!resource) {
        throw new Error(`Resource ${name} not found`)
      }

      // Deep clone the resource to avoid reference issues
      resourceForm.value = {
        name,
        type: resource.type || 'collection',
        languages: [...(resource.languages || ['en'])],
        titles: { ...(resource.titles || { en: '' }) },
        descriptions: { ...(resource.descriptions || { en: '' }) },
        provider: {
          type: resource.provider?.type || DEFAULT_RESOURCE.provider.type,
          name: resource.provider?.name || DEFAULT_RESOURCE.provider.name,
          data: resource.provider?.data || DEFAULT_RESOURCE.provider.data,
          properties: { ...(resource.provider?.properties || {}) },
          options: { ...(resource.provider?.options || {}) }
        }
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load resource')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const saveResource = async (resource: Resource) => {
    try {
      isLoading.value = true

      // Validate required fields
      if (!resource.name) {
        throw new Error('Resource name is required')
      }

      if (!resource.type) {
        throw new Error('Resource type is required')
      }

      if (!resource.provider?.type || !resource.provider?.name || !resource.provider?.data) {
        throw new Error('Provider configuration is incomplete')
      }

      // Validate titles and descriptions for all languages
      for (const lang of resource.languages) {
        if (!resource.titles[lang]) {
          throw new Error(`Title for language ${lang} is required`)
        }
        if (!resource.descriptions[lang]) {
          throw new Error(`Description for language ${lang} is required`)
        }
      }

      await configStore.updateResource(resource.name, resource)
      showSuccess('Resource saved successfully')
      return true
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to save resource')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteResource = async (name: string) => {
    try {
      isLoading.value = true
      await configStore.deleteResource(name)
      showSuccess('Resource deleted successfully')
      return true
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete resource')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetForm = () => {
    resourceForm.value = { ...DEFAULT_RESOURCE }
    isEdit.value = false
  }

  return {
    resourceForm,
    isLoading,
    isEdit,
    loadResource,
    saveResource,
    deleteResource,
    resetForm
  }
}
