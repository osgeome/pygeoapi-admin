import type { BaseResource } from './resource'
import type { ProviderConfig } from './provider'

/** Resource Form Data Interface */
export interface ResourceFormData extends BaseResource {
  languages: string[]
  titles: Record<string, string>
  descriptions: Record<string, string>
  provider: ProviderConfig & {
    properties: Record<string, string>
    options: Record<string, any>
  }
}

/** Default Provider Values */
export const DEFAULT_PROVIDER = {
  type: 'feature',
  name: '',
  data: '',
  properties: {},
  options: {}
} as const

/** Default Resource Form Values */
export const DEFAULT_RESOURCE_FORM: ResourceFormData = {
  name: '',
  type: 'collection',
  languages: ['en'],
  titles: { en: '' },
  descriptions: { en: '' },
  provider: { ...DEFAULT_PROVIDER }
}

/** Available Languages */
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' }
]
