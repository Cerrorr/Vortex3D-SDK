import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VortexEngine } from '@vortex3d/core'

createApp(App).mount('#app')

const engine = new VortexEngine('app')
engine.init()