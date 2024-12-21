/** Provider Types */
export type ProviderType = 'feature' | 'coverage' | 'record' | 'map' | 'tile' | 'edr' | 'stac'

/** PostgreSQL Provider Options */
export interface PostgreSQLOptions {
  connect_timeout?: number
  tcp_user_timeout?: number
  keepalives?: number
  keepalives_idle?: number
  keepalives_count?: number
  keepalives_interval?: number
}

/** Base Provider Configuration */
export interface BaseProviderConfig {
  type: ProviderType
  default?: boolean
  name: string
  data: string | object
  editable?: boolean
  table?: string
  id_field?: string
  geometry?: {
    x_field: string
    y_field: string
  }
  time_field?: string
  title_field?: string
  format?: {
    name: string
    mimetype: string
  }
  options?: PostgreSQLOptions | Record<string, any>
  properties?: string[]
  crs?: string[]
  storage_crs?: string
  storage_crs_coordinate_epoch?: number
}

/** Feature Provider Configuration */
export interface FeatureProviderConfig extends BaseProviderConfig {
  type: 'feature'
}

/** Coverage Provider Configuration */
export interface CoverageProviderConfig extends BaseProviderConfig {
  type: 'coverage'
}

/** Record Provider Configuration */
export interface RecordProviderConfig extends BaseProviderConfig {
  type: 'record'
}

/** Map Provider Configuration */
export interface MapProviderConfig extends BaseProviderConfig {
  type: 'map'
}

/** Tile Provider Configuration */
export interface TileProviderConfig extends BaseProviderConfig {
  type: 'tile'
}

/** EDR Provider Configuration */
export interface EDRProviderConfig extends BaseProviderConfig {
  type: 'edr'
}

/** STAC Provider Configuration */
export interface STACProviderConfig extends BaseProviderConfig {
  type: 'stac'
}

/** Provider Configuration Union Type */
export type ProviderConfig =
  | FeatureProviderConfig
  | CoverageProviderConfig
  | RecordProviderConfig
  | MapProviderConfig
  | TileProviderConfig
  | EDRProviderConfig
  | STACProviderConfig
