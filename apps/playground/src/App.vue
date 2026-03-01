<script setup lang="ts">
/**
 * Vortex3D 业务测试平台 - App.vue
 * * 核心功能：
 * 1. 引擎初始化与销毁管理
 * 2. 本地模型文件 (GLB/FBX/OBJ/STL) 上传预览
 * 3. 实时切换网格辅助线状态
 * 4. 采用 shallowRef 隔离响应式，确保渲染性能
 */
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { VortexEngine } from '@vortex3d/core';

// 1. 响应式状态管理
// 使用 shallowRef 避免 Vue 对 Three.js 内部数万个对象进行深度代理，防止卡顿
const engineRef = shallowRef<VortexEngine | null>(null);
const showGrid = ref(true); // 默认显示网格
const statusMessage = ref('Ready'); // 当前状态提示
const fileName = ref(''); // 当前加载的文件名

// 2. 生命周期管理
onMounted(() => {
  // 初始化引擎实例
  const engine = new VortexEngine('webgl-container', {
    // 这里的路径对应的是 apps/playground/public/draco/gltf/
    dracoPath: '/draco/gltf/' 
  });
  
  // 启动引擎渲染循环
  engine.init();
  engineRef.value = engine;

  console.log('[App] Vortex3D Playground initialized.');
});

onBeforeUnmount(() => {
  // 组件销毁时必须严格执行引擎的清理管道，防止内存泄漏
  if (engineRef.value) {
    engineRef.value.dispose();
  }
});

// 3. 核心业务逻辑
/**
 * 处理本地模型文件上传
 */
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file || !engineRef.value) return;

  try {
    statusMessage.value = 'Parsing...';
    fileName.value = file.name;
    
    console.log(`[App] Feeding file to engine: ${file.name}`);
    
    // 调用 SDK 内部的加载逻辑
    await engineRef.value.loadLocalModel(file);
    
    statusMessage.value = 'Model Loaded Successfully';
  } catch (error) {
    console.error('[App] Model loading error:', error);
    statusMessage.value = 'Load Failed';
  } finally {
    // 重置 input 以便下次选择同一文件能正常触发 change
    input.value = '';
  }
};

/**
 * 切换网格可见性
 */
const onGridToggle = () => {
  if (engineRef.value) {
    engineRef.value.setGridVisible(showGrid.value);
  }
};
</script>

<template>
  <div id="webgl-container"></div>

  <div class="ui-layer">
    <div class="upload-card">
      <header>
        <h2>Vortex3D Engine</h2>
        <span class="version">v1.0.0</span>
      </header>
      
      <p class="description">支持拖入或选择本地 GLB, FBX, OBJ, STL 格式模型进行预览。</p>
      
      <div class="input-section">
        <label class="custom-file-upload">
          <input 
            type="file" 
            accept=".glb,.gltf,.fbx,.obj,.stl" 
            @change="handleFileUpload" 
          />
          选择本地模型
        </label>
        <div v-if="fileName" class="file-info">
          {{ fileName }}
        </div>
      </div>

      <hr class="divider" />

      <div class="controls-section">
        <label class="checkbox-item">
          <input 
            type="checkbox" 
            v-model="showGrid" 
            @change="onGridToggle" 
          />
          <span>显示网格辅助线</span>
        </label>
      </div>

      <footer class="status-bar">
        <span class="status-indicator"></span>
        {{ statusMessage }}
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 1. 3D 容器布局 */
#webgl-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  background-color: #1a1a1a;
  outline: none;
}

/* 2. UI 层穿透处理：这是 OrbitControls 能起作用的关键 */
.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  padding: 30px;
  pointer-events: none; /* 让 UI 层本身不拦截鼠标，点击可穿透到 Canvas */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

/* 3. 上传卡片面板：恢复点击交互 */
.upload-card {
  pointer-events: auto; /* 面板内部按钮恢复交互 */
  width: 340px;
  padding: 24px;
  background: rgba(25, 25, 25, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  color: #fff;
  font-family: 'Inter', -apple-system, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #00ff00; /* 主题绿 */
  font-weight: 700;
  letter-spacing: -0.5px;
}

.version {
  font-size: 0.7rem;
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.description {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
  margin-bottom: 24px;
}

/* 自定义上传按钮 */
.custom-file-upload {
  display: block;
  width: 100%;
  padding: 12px;
  background: #00ff00;
  color: #000;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-file-upload:hover {
  background: #00cc00;
  transform: translateY(-2px);
}

.custom-file-upload input[type="file"] {
  display: none;
}

.file-info {
  margin-top: 10px;
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: 20px 0;
}

/* 控制项样式 */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #ddd;
}

.checkbox-item input[type="checkbox"] {
  accent-color: #00ff00;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 状态条 */
.status-bar {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #888;
}

.status-indicator {
  width: 6px;
  height: 6px;
  background: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff00;
}
</style>