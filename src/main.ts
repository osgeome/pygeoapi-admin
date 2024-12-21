import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loader } from '@guolao/vue-monaco-editor'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import App from './App.vue'
import router from './router'

// Create Vuetify instance with all components
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Monaco Editor Configuration
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    return new editorWorker()
  }
}

// Configure Monaco for YAML
monaco.languages.register({ id: 'yaml' })

// Basic YAML syntax highlighting
monaco.languages.setMonarchTokensProvider('yaml', {
  tokenizer: {
    root: [
      [/^[\t ]*[A-Za-z_\-0-9]+(?=\:)/, 'key'],
      [/\:/, 'delimiter'],
      [/#.*$/, 'comment'],
      [/^[\t ]*\-/, 'delimiter'],
      [/^[\t ]+/, 'white'],
      [/"[^"]*"/, 'string'],
      [/'[^']*'/, 'string'],
      [/[0-9]+(\.[0-9]+)?/, 'number'],
      [/true|false/, 'boolean'],
      [/null/, 'keyword'],
    ]
  }
})

loader.config({ monaco })

// Create Vue app
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
