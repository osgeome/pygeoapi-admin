import type { PyGeoApiConfig } from './config'

export interface ConfigVersion {
  id: number
  jsonContent: PyGeoApiConfig
  yamlContent: string
  timestamp: number
  description?: string
}

export interface ConfigState {
  currentJson: PyGeoApiConfig | null
  currentYaml: string
  history: ConfigVersion[]
  lastId: number
  currentHistoryIndex: number
  redoStack: ConfigVersion[]
}
