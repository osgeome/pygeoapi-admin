import { ref } from 'vue'
import type { ResourceFormData } from '@/types/forms'

export function useLanguages(resourceForm: ResourceFormData) {
  const newLanguage = ref('')

  const addLanguage = (lang: string) => {
    if (lang && !resourceForm.languages.includes(lang)) {
      resourceForm.languages.push(lang)
      resourceForm.titles[lang] = ''
      resourceForm.descriptions[lang] = ''
      return true
    }
    return false
  }

  const removeLanguage = (lang: string) => {
    if (lang === 'en') return false // Prevent removing English
    const index = resourceForm.languages.indexOf(lang)
    if (index > -1) {
      resourceForm.languages.splice(index, 1)
      delete resourceForm.titles[lang]
      delete resourceForm.descriptions[lang]
      return true
    }
    return false
  }

  return {
    newLanguage,
    addLanguage,
    removeLanguage
  }
}
