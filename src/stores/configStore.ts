import { defineStore } from 'pinia'
import * as YAML from 'yaml'
import type { PyGeoApiConfig } from '@/types/config'
import type { ConfigState, ConfigVersion } from '@/types/store'

export const useConfigStore = defineStore('config', {
  state: (): ConfigState => ({
    currentJson: null,
    currentYaml: '',
    history: [],
    lastId: 0,
    currentHistoryIndex: -1,
    redoStack: []
  }),

  getters: {
    canUndo: (state) => state.history.length > 0 && state.currentHistoryIndex > -1,
    canRedo: (state) => state.redoStack.length > 0
  },

  actions: {
    saveToLocalStorage() {
      if (this.currentJson && this.currentYaml) {
        localStorage.setItem('pygeoapi-config-json', JSON.stringify(this.currentJson))
        localStorage.setItem('pygeoapi-config-yaml', this.currentYaml)
      }
    },

    async loadConfig() {
      try {
        const storedYaml = localStorage.getItem('pygeoapi-config-yaml')
        const storedJson = localStorage.getItem('pygeoapi-config-json')
        if (storedYaml && storedJson) {
          this.currentYaml = storedYaml
          this.currentJson = JSON.parse(storedJson) as PyGeoApiConfig
        } else {
          this.currentJson = {
            server: {
              url: '',
              bind: {
                host: 'localhost',
                port: 5000
              },
              mimetype: 'application/json',
              encoding: 'utf-8',
              languages: ['en'],
              map: {
                url: '',
                attribution: ''
              }
            },
            logging: {
              level: 'INFO'
            },
            metadata: {
              identification: {
                title: '',
                description: '',
                keywords: {},
                url: ''
              },
              license: {
                name: '',
                url: ''
              },
              provider: {
                name: '',
                url: ''
              },
              contact: {
                name: '',
                email: ''
              }
            },
            resources: {}
          }
          this.currentYaml = YAML.stringify(this.currentJson)
        }
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error loading config:', error)
      }
    },

    async saveConfig(jsonContent: PyGeoApiConfig) {
      try {
        const yamlContent = YAML.stringify(jsonContent)
        
        // Clear redo stack when new changes are made
        this.redoStack = []
        
        // Update state
        this.$patch({
          currentJson: jsonContent,
          currentYaml: yamlContent
        })

        // Add to history
        const version: ConfigVersion = {
          id: ++this.lastId,
          jsonContent,
          yamlContent,
          timestamp: Date.now()
        }
        this.history.unshift(version)
        this.currentHistoryIndex = 0

        // Save to local storage
        this.saveToLocalStorage()

        // Keep only last 10 versions
        if (this.history.length > 10) {
          this.history = this.history.slice(0, 10)
        }

        return version
      } catch (error) {
        console.error('Error saving config:', error)
        throw error
      }
    },

    async importYAML(yamlContent: string) {
      try {
        console.log('Importing YAML:', yamlContent)
        const jsonContent = YAML.parse(yamlContent)
        console.log('Parsed JSON:', jsonContent)
        
        // Update state directly first
        this.$patch({
          currentJson: jsonContent,
          currentYaml: yamlContent
        })
        
        // Then save to create version
        const version = await this.saveConfig(jsonContent)
        return version
      } catch (error) {
        console.error('Error importing YAML:', error)
        throw error
      }
    },

    async importJSON(jsonContent: string) {
      try {
        const parsedJson = JSON.parse(jsonContent)
        const yamlContent = YAML.stringify(parsedJson)
        
        // Update state directly first
        this.$patch({
          currentJson: parsedJson,
          currentYaml: yamlContent
        })
        
        // Then save to create version
        const version = await this.saveConfig(parsedJson)
        return version
      } catch (error) {
        console.error('Error importing JSON:', error)
        throw error
      }
    },

    async exportYAML() {
      return this.currentYaml
    },

    async importFromAPI(apiUrl: string) {
      try {
        const response = await fetch(`${apiUrl}/admin/config`)
        const jsonContent = await response.json()
        await this.saveConfig(jsonContent)
      } catch (error) {
        console.error('Error importing from API:', error)
        throw error
      }
    },

    async saveToAPI(apiUrl: string) {
      try {
        const response = await fetch(`${apiUrl}/admin/config`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.currentJson)
        })

        if (!response.ok) throw new Error('Failed to save config to API')

        return true
      } catch (error) {
        console.error('Error saving to API:', error)
        throw error
      }
    },

    async saveVersion(content: string, format: 'yaml' | 'json') {
      try {
        let jsonContent: PyGeoApiConfig
        let yamlContent: string

        // Convert content based on format
        if (format === 'yaml') {
          yamlContent = content
          jsonContent = YAML.parse(content)
        } else {
          jsonContent = JSON.parse(content)
          yamlContent = YAML.stringify(jsonContent)
        }

        // Update state
        this.$patch({
          currentJson: jsonContent,
          currentYaml: yamlContent
        })

        // Add to history
        const version: ConfigVersion = {
          id: ++this.lastId,
          jsonContent,
          yamlContent,
          timestamp: Date.now()
        }
        this.history.unshift(version)
        this.currentHistoryIndex = 0

        // Save to local storage
        this.saveToLocalStorage()

        // Keep only last 10 versions
        if (this.history.length > 10) {
          this.history = this.history.slice(0, 10)
        }

        return version
      } catch (error) {
        console.error('Error saving version:', error)
        throw error
      }
    },

    async undo() {
      if (!this.canUndo) return

      // Save current state to redo stack
      const currentVersion = {
        id: this.lastId + 1,
        jsonContent: this.currentJson,
        yamlContent: this.currentYaml,
        timestamp: Date.now()
      }
      this.redoStack.push(currentVersion)

      // Get previous version
      const previousVersion = this.history[this.currentHistoryIndex]
      this.currentHistoryIndex--

      // Update state
      this.$patch({
        currentJson: previousVersion.jsonContent,
        currentYaml: previousVersion.yamlContent
      })

      // Update local storage
      this.saveToLocalStorage()
    },

    async redo() {
      if (!this.canRedo) return

      // Get next version from redo stack
      const nextVersion = this.redoStack.pop()!
      
      // Save current state to history
      const currentVersion = {
        id: this.lastId + 1,
        jsonContent: this.currentJson,
        yamlContent: this.currentYaml,
        timestamp: Date.now()
      }
      this.history.splice(this.currentHistoryIndex + 1, 0, currentVersion)
      this.currentHistoryIndex++

      // Update state
      this.$patch({
        currentJson: nextVersion.jsonContent,
        currentYaml: nextVersion.yamlContent,
        lastId: nextVersion.id
      })

      // Update local storage
      this.saveToLocalStorage()
    }
  }
})