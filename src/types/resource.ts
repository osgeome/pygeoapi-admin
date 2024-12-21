import type { I18nString, I18nKeywords } from './common'

/** Resource Type Enum */
export type ResourceType = 'collection' | 'stac-collection' | 'process'

/** Base Resource Interface */
export interface BaseResource {
  name: string
  type: ResourceType
  languages: string[]
  titles: Record<string, string>
  descriptions: Record<string, string>
  visibility?: 'default' | 'hidden'
  keywords?: I18nKeywords
  'linked-data'?: {
    item_template?: string
    context?: Array<Record<string, string | object>>
  }
  links?: Array<{
    type: string
    rel: string
    title?: string
    href: string
    hreflang?: string
    length?: number
  }>
  extents?: {
    spatial: {
      bbox: number[]
      crs?: string
    }
    temporal?: {
      begin?: string | null
      end?: string | null
      trs?: string
    }
  }
}

/** Provider Config Interface */
export interface ProviderConfig {
  type: 'feature' | 'coverage' | 'record' | 'tile' | 'map'
  name: string
  data: string
  properties: Record<string, any>
  options: Record<string, any>
}

/** Resource Interface */
export interface Resource extends BaseResource {
  provider: ProviderConfig
}

/** Collection Resource */
export interface CollectionResource extends Resource {
  type: 'collection'
}

/** STAC Collection Resource */
export interface StacCollectionResource extends Resource {
  type: 'stac-collection'
}

/** Process Resource */
export interface ProcessResource extends Omit<Resource, 'type' | 'provider'> {
  type: 'process'
  processor: {
    name: string
  }
}

/** Default Provider Config */
export const DEFAULT_PROVIDER: ProviderConfig = {
  type: 'feature',
  name: '',
  data: '',
  properties: {},
  options: {}
} as const

/** Default Resource */
export const DEFAULT_RESOURCE: Resource = {
  name: '',
  type: 'collection',
  languages: ['en'],
  titles: { en: '' },
  descriptions: { en: '' },
  provider: { ...DEFAULT_PROVIDER }
} as const

/** Resource Type Constants */
export const RESOURCE_TYPES = ['collection', 'stac-collection', 'process'] as const
export type ResourceTypeString = typeof RESOURCE_TYPES[number]
