import type { ResourceType, BaseResource } from '@/types/resource'
import type { ProviderConfig } from '@/types/provider'
import type { I18nString } from '@/types/common'

export const validateResourceName = (name: string): string | true => {
  if (!name) return 'Resource name is required'
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return 'Resource name can only contain lowercase letters, numbers, hyphens, and underscores'
  }
  return true
}

export const validateResourceType = (type: ResourceType['type']): string | true => {
  if (!type) return 'Resource type is required'
  if (!['collection', 'stac-collection', 'process'].includes(type)) {
    return 'Invalid resource type'
  }
  return true
}

export const validateProviderConfig = (provider: ProviderConfig): string | true => {
  if (!provider.type) return 'Provider type is required'
  if (!provider.name) return 'Provider name is required'
  return true
}

export const validateLanguageContent = (
  titles: I18nString,
  descriptions: I18nString,
  languages: string[]
): string | true => {
  // Check if all languages have titles
  for (const lang of languages) {
    if (!titles[lang]) {
      return `Title is required for language: ${lang}`
    }
    if (!descriptions[lang]) {
      return `Description is required for language: ${lang}`
    }
  }
  return true
}

export const validateResourceForm = (resource: BaseResource): string | true => {
  if (!resource) return 'Resource is required'

  // Validate title and description for all languages
  const languages = Object.keys(resource.title || {})
  if (languages.length === 0) {
    return 'At least one language is required for title and description'
  }

  const langValidation = validateLanguageContent(
    resource.title,
    resource.description,
    languages
  )
  if (langValidation !== true) return langValidation

  // Validate providers if present
  if (resource.providers?.length) {
    for (const provider of resource.providers) {
      const providerValidation = validateProviderConfig(provider)
      if (providerValidation !== true) return providerValidation
    }
  }

  return true
}
