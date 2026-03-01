import { SceneManager } from './managers/SceneManager'
import { CameraManager } from './managers/CameraManager'
import { RendererManager } from './managers/RendererManager'
import { ModelLoaderManager } from './managers/ModelLoaderManager'
import { LightingManager } from './managers/LightingManager'
import { HelperManager } from './managers/HelperManager'
import { EventBus } from './utils/EventBus'
import { Object3D } from 'three'

/**
 * 引擎初始化选项接口
 */
export interface EngineOptions {
  dracoPath?: string
}

/**
 * Vortex3D 引擎核心类
 * 作为整个 SDK 的门面，统筹协调各个管理器的运行
 */
export class VortexEngine {
  private container: HTMLElement
  private eventBus: EventBus

  public sceneManager: SceneManager
  public helperManager: HelperManager
  public cameraManager: CameraManager
  public rendererManager: RendererManager
  public modelLoaderManager: ModelLoaderManager
  public lightingManager: LightingManager

  constructor(containerId: string, options: EngineOptions = {}) {
    const el = document.getElementById(containerId)
    if (!el) {
      throw new Error(
        `[Vortex3D] Specified DOM container not found: ${containerId}`
      )
    }
    this.container = el

    const dracoPath = options.dracoPath || '/draco/gltf/'
    this.eventBus = new EventBus()

    // 1. 先初始化场景
    this.sceneManager = new SceneManager(this.eventBus)

    this.helperManager = new HelperManager(
      this.sceneManager.instance,
      this.eventBus
    )
    // 2. 初始化渲染器
    this.rendererManager = new RendererManager(this.container, this.eventBus)

    // 3. 初始化灯光
    this.lightingManager = new LightingManager(
      this.sceneManager.instance,
      this.eventBus
    )

    // 4. 初始化相机，传入渲染器的 DOM 元素用于交互监听
    this.cameraManager = new CameraManager(
      this.container,
      this.rendererManager.instance.domElement,
      this.eventBus
    )

    // 5. 初始化模型加载器
    this.modelLoaderManager = new ModelLoaderManager(this.eventBus, dracoPath)

    console.log('[Vortex3D Core] Engine core modules with interaction loaded.')
  }

  /**
   * 启动引擎
   */
  public init() {
    window.addEventListener('resize', this.onWindowResize)
    this.rendererManager.startLoop(
      this.sceneManager.instance,
      this.cameraManager.instance
    )
  }

  /**
   * 内部方法：统一处理模型添加后的适配逻辑
   */
  private async addModelToScene(model: Object3D) {
    this.sceneManager.instance.add(model)

    // 触发灯光自动适配
    this.lightingManager.adjustToModel(model)

    console.log('[Vortex3D Core] Model integrated with lighting system.')
  }

  /**
   * 加载本地模型文件
   */
  public async loadLocalModel(file: File) {
    try {
      const model = await this.modelLoaderManager.loadFromFile(file)
      await this.addModelToScene(model)
    } catch (error) {
      console.error('[Vortex3D Core] Error loading local model.', error)
    }
  }

  /**
   * 通过 URL 加载模型
   */
  public async loadModelFromURL(url: string) {
    try {
      const model = await this.modelLoaderManager.loadFromURL(url)
      await this.addModelToScene(model)
    } catch (error) {
      console.error('[Vortex3D Core] Error loading model from URL.', error)
    }
  }

  /**
   * 切换网格显示状态的公有方法
   */
  public setGridVisible(visible: boolean) {
    this.helperManager.toggleGrid(visible)
  }
  /**
   * 窗口自适应
   */
  private onWindowResize = () => {
    const { clientWidth, clientHeight } = this.container
    this.eventBus.emit('resize', clientWidth, clientHeight)
  }

  /**
   * 销毁引擎实例
   */
  public dispose() {
    console.log('[Vortex3D Core] Starting engine disposal pipeline...')
    window.removeEventListener('resize', this.onWindowResize)

    this.rendererManager.dispose()
    this.cameraManager.dispose()
    this.sceneManager.dispose()
    this.lightingManager.dispose()
    this.modelLoaderManager.dispose()
    this.helperManager.dispose()
    this.eventBus.clear()
    this.container.innerHTML = ''
  }
}
