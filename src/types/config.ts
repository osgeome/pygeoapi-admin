import type { I18nString, I18nKeywords } from './common'
import type { ResourceType } from './resource'

/** Server configuration */
export interface ServerConfig {
  bind: {
    host: string
    port: number
  }
  url: string
  admin?: boolean
  mimetype: string
  encoding: string
  gzip?: boolean
  language?: string
  languages?: string[]
  locale_dir?: string
  cors?: boolean
  pretty_print?: boolean
  limit?: number
  templates?: {
    path: string
    static: string
  }
  map: {
    url: string
    attribution: string
  }
  ogc_schemas_location?: string
  manager?: {
    name: string
    connection: string
    output_dir: string
  }
  api_rules?: {
    api_version?: string
    strict_slashes?: boolean
    url_prefix?: string
    version_header?: string
  }
}

/** Logging configuration */
export interface LoggingConfig {
  level: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' | 'NOTSET'
  logfile?: string
  logformat?: string
  dateformat?: string
  rotation?: {
    mode: 'size' | 'time'
    when?: 's' | 'm' | 'h' | 'd' | 'w0' | 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6' | 'midnight'
    interval?: number
    max_bytes?: number
    backup_count?: number
  }
}

/** Metadata configuration */
export interface MetadataConfig {
  identification: {
    title: I18nString
    description: I18nString
    keywords: I18nKeywords
    keywords_type?: 'discipline' | 'temporal' | 'place' | 'theme' | 'stratum'
    terms_of_service?: I18nString
    url: string
  }
  license: {
    name: I18nString
    url: I18nString
  }
  provider: {
    name: I18nString
    url: I18nString
  }
  contact: {
    name: string
    position?: string
    address?: string
    city?: string
    stateorprovince?: string
    postalcode?: string
    country?: string
    phone?: string
    fax?: string
    email?: string
    url?: string
    hours?: string
    instructions?: string
    role?: string
  }
}

/** Main pygeoapi configuration */
export interface PyGeoApiConfig {
  server: ServerConfig
  logging: LoggingConfig
  metadata: MetadataConfig
  resources: Record<string, ResourceType>
}
