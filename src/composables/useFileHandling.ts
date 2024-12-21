import { ref } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { FileError, handleError, isValidJSON, isValidYAML } from '@/utils/error'
import { useNotification } from '@/composables/useNotification'

export function useFileHandling() {
  const configStore = useConfigStore()
  const { error: showError, success: showSuccess } = useNotification()
  const showExportDialog = ref(false)
  const exportFormat = ref('yaml')
  const exportFormats = ['yaml', 'json']

  const handleFileImport = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return false

    const file = input.files[0]
    const reader = new FileReader()

    try {
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      })

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!['json', 'yaml', 'yml'].includes(fileExtension || '')) {
        throw new FileError('Invalid file format. Please upload a JSON or YAML file.')
      }

      // Validate file content
      if (fileExtension === 'json' && !isValidJSON(content)) {
        throw new FileError('Invalid JSON format')
      }
      if (['yaml', 'yml'].includes(fileExtension) && !isValidYAML(content)) {
        throw new FileError('Invalid YAML format')
      }

      await configStore.importConfig(content, fileExtension as 'json' | 'yaml')
      showSuccess('Configuration imported successfully')
      return true
    } catch (err) {
      const message = handleError(err)
      showError(message)
      return false
    } finally {
      // Reset input
      input.value = ''
    }
  }

  const exportConfig = async () => {
    try {
      const content = await configStore.exportConfig(exportFormat.value as 'json' | 'yaml')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pygeoapi-config.${exportFormat.value}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showSuccess('Configuration exported successfully')
      return true
    } catch (err) {
      const message = handleError(err)
      showError(message)
      return false
    }
  }

  return {
    showExportDialog,
    exportFormat,
    exportFormats,
    handleFileImport,
    exportConfig
  }
}
