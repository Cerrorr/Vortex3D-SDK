<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { VortexEngine } from '@vortex3d/core'

const engineRef = shallowRef<VortexEngine | null>(null)

onMounted(() => {
  const engine = new VortexEngine('webgl-container', {
    dracoPath: '/draco/gltf/'
  })

  engine.init()
  engineRef.value = engine
})

onBeforeUnmount(() => {
  if (engineRef.value) {
    engineRef.value.dispose()
  }
})

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !engineRef.value) return

  try {
    console.log('[Vue Playground] 开始喂给引擎文件:', file.name)

    await engineRef.value.loadLocalModel(file)

    input.value = ''
  } catch (error) {
    console.error('[Vue Playground] 模型加载失败:', error)
  }
}
</script>

<template>
  <div class="ui-layer">
    <div class="upload-card">
      <h2>Vortex3D Engine</h2>
      <p>本地模型导入测试</p>

      <input
        type="file"
        accept=".glb,.gltf,.fbx"
        @change="handleFileUpload"
        class="file-input"
      />
    </div>
  </div>

  <div id="webgl-container"></div>
</template>

<style scoped>
.ui-layer {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  pointer-events: auto;
}

.upload-card {
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid #444;
  padding: 20px;
  border-radius: 8px;
  color: white;
  font-family: sans-serif;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

h2 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #00ff00;
}
p {
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  color: #ccc;
}

.file-input {
  color: white;
  cursor: pointer;
}

#webgl-container {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
