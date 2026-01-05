

**Vortex3D SDK**

## **1\. 项目定位**

**Vortex3D** 是一个基于 Three.js 封装的业务通用 3D SDK。它旨在屏蔽底层复杂的 WebGL 细节，为 Vue、React 及原生 JS 项目提供一套声明式、高性能、易扩展的 3D 渲染解决方案。



**2\. 技术栈架构 (Tech Stack)**

| 维度 | 技术选型 | 理由 |
| :---- | :---- | :---- |
| **内核引擎** | **Three.js** | 行业标准，生态最强，插件丰富。 |
| **动画驱动** | **GSAP** | 相比 Tween.js 拥有更强的 Timeline 管理和缓动函数，适合复杂交互。 |
| **开发语言** | **TypeScript** | 强类型约束是大型 SDK 开发、维护和用户使用的基础。 |
| **构建工具** | **Rollup \+ Tsup** | 极致的 Tree-shaking，输出干净的 ESM/CJS 产物。 |
| **代码规范** | **ESLint \+ Prettier** | 保证团队协作代码风格统一。 |



**3\. 核心设计原则**

### **3.1 宽泛接口设计 (API Flexibility)**

所有涉及坐标、颜色、旋转的接口均需支持多种输入格式，由 SDK 内部统一转化。

* **坐标输入**：支持 \[x, y, z\]、{x, y, z} 或 THREE.Vector3。  
* **颜色输入**：支持 0xff0000、'\#ff0000'、'red' 或 THREE.Color。

### **3.2 声明式生命周期**

SDK 自动接管 Canvas 的尺寸自适应、渲染循环、渲染器清理（Dispose），业务侧仅需关注“场景里有什么”。

### **3.3 插件化扩展 (Plugin Architecture)**

核心包保持精简（Core），高级功能（后期处理、物理模拟、测量工具）以插件形式注入。



**4\. 功能版图**

### **第一阶段：基础架构 (Phase 1: Foundation)**

* **Viewer 容器**：支持多实例，自动处理抗锯齿、像素比、Resize 监听。  
* **SmartLoader**：集成 GLTF、KTX2、HDR 的统一加载管理与进度反馈。  
* **Camera System**：封装 flyTo、lookAt 等带过渡动画的相机指令。  
* **Memory Guard**：实现 dispose 机制，确保材质、几何体、贴图在销毁时彻底释放。

### **第二阶段：业务组件 (Phase 2: Business)**

* **交互系统**：封装原生 Raycaster，提供 on('click')、on('hover') 等语义化事件。  
* **标签系统**：支持 CSS2D/CSS3D 标签混合渲染，解决 UI 随动问题。  
* **环境预设**：一键切换天气、光影效果及背景贴图。

### **第三阶段：视觉增强 (Phase 3: Visuals)**

* **GSAP 动画库**：内置常用 3D 动效（如浮动、展开、循环旋转）。  
* **后期特效**：集成常用的 Bloom（发光）、Outline（描边）特效插件。



**5\. 项目目录结构预设**

Plaintext

vortex3d/  
├── packages/  
│   ├── core/               \# SDK 核心逻辑  
│   │   ├── src/  
│   │   │   ├── base/       \# Viewer 核心类  
│   │   │   ├── math/       \# 宽泛接口转化工具 (toVector3, etc.)  
│   │   │   ├── managers/   \# 加载、相机、灯光管理  
│   │   │   └── index.ts    \# 统一导出  
│   ├── plugins/            \# 官方插件包  
│   └── docs/               \# 文档与 API 说明  
├── examples/               \# 原生 JS 调试示例  
├── tsup.config.ts          \# 构建配置  
└── package.json


