import { ref, computed, shallowRef, nextTick } from 'vue'
import type { editor } from 'monaco-editor'
import * as YAML from 'js-yaml'
import { useNotification } from './useNotification'

export function useCodeEditor(initialFormat: 'yaml' | 'json' = 'yaml') {
  const { success, error: showError } = useNotification()
  
  // Editor state
  const format = ref(initialFormat)
  const editorContent = ref('')
  const initialContent = ref('')
  const monacoEditor = shallowRef<editor.IStandaloneCodeEditor>()

  // Computed
  const hasUnsavedChanges = computed(() => {
    return editorContent.value !== initialContent.value
  })

  // Editor options
  const editorOptions = {
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    quickSuggestions: true,
    folding: true,
    bracketPairColorization: { enabled: true },
    tabSize: 2,
  }

  // Methods
  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    monacoEditor.value = editor
  }

  const handleEditorChange = (value: string) => {
    editorContent.value = value
  }

  const validateContent = (content: string, contentFormat: 'yaml' | 'json'): boolean => {
    try {
      if (contentFormat === 'json') {
        JSON.parse(content)
      } else {
        YAML.load(content)
      }
      return true
    } catch {
      return false
    }
  }

  const updateEditorContent = (content: string) => {
    if (!content) {
      showError('Cannot update editor with empty content')
      return
    }

    if (!validateContent(content, format.value)) {
      showError(`Invalid ${format.value.toUpperCase()} format`)
      return
    }

    try {
      editorContent.value = content
      initialContent.value = content
    } catch (err) {
      showError(`Error updating editor content: ${err.message}`)
    }
  }

  const switchFormat = async (newFormat: 'yaml' | 'json') => {
    if (format.value === newFormat) return

    try {
      let content: string
      const currentContent = editorContent.value || '{}'

      if (newFormat === 'yaml') {
        const jsonContent = JSON.parse(currentContent)
        content = YAML.dump(jsonContent, { indent: 2, lineWidth: -1 })
      } else {
        const jsonContent = YAML.load(currentContent)
        content = JSON.stringify(jsonContent, null, 2)
      }

      if (!validateContent(content, newFormat)) {
        throw new Error(`Invalid ${newFormat.toUpperCase()} format`)
      }

      format.value = newFormat
      nextTick(() => {
        updateEditorContent(content)
        success(`Switched to ${newFormat.toUpperCase()} format`)
      })
    } catch (err) {
      showError(`Error converting to ${newFormat.toUpperCase()}: ${err.message}`)
    }
  }

  const getCurrentContent = () => {
    return {
      content: editorContent.value,
      format: format.value
    }
  }

  const setContent = (content: string, contentFormat: 'yaml' | 'json') => {
    if (contentFormat !== format.value) {
      switchFormat(contentFormat)
    } else {
      updateEditorContent(content)
    }
  }

  return {
    // State
    format,
    editorContent,
    monacoEditor,
    hasUnsavedChanges,
    editorOptions,

    // Methods
    handleEditorMount,
    handleEditorChange,
    updateEditorContent,
    switchFormat,
    getCurrentContent,
    setContent,
    validateContent
  }
}
