import { SceneManager } from './managers/SceneManager'
import { CameraManager } from './managers/CameraManager'
import { RendererManager } from './managers/RendererManager'
import { ModelLoaderManager } from './managers/ModelLoaderManager'
import { EventBus } from './utils/EventBus'

// 👉 新增：定义引擎初始化配置项
export interface EngineOptions {
  dracoPath?: string
}

export class VortexEngine {
  private container: HTMLElement
  private eventBus: EventBus

  public sceneManager: SceneManager
  public cameraManager: CameraManager
  public rendererManager: RendererManager
  public modelLoaderManager: ModelLoaderManager

  // 接收 options 配置，并给 dracoPath 设定一个默认的相对路径
  constructor(containerId: string, options: EngineOptions = {}) {
    const el = document.getElementById(containerId)
    if (!el) {
      throw new Error(
        `[Vortex3D] Specified DOM container not found: ${containerId}`
      )
    }
    this.container = el

    // 解析配置项，默认指向网站根目录下的 /draco/gltf/
    const dracoPath = options.dracoPath || '/draco/gltf/'

    this.eventBus = new EventBus()

    this.sceneManager = new SceneManager(this.eventBus)
    this.cameraManager = new CameraManager(this.container, this.eventBus)
    this.rendererManager = new RendererManager(this.container, this.eventBus)

    // 将解析好的路径传给管家
    this.modelLoaderManager = new ModelLoaderManager(this.eventBus, dracoPath)

    console.log('[Vortex3D Core] Engine core modules loaded successfully.')
  }

  public init() {
    window.addEventListener('resize', this.onWindowResize)
    this.rendererManager.startLoop(
      this.sceneManager.instance,
      this.cameraManager.instance
    )
  }

  public async loadLocalModel(file: File) {
    try {
      const model = await this.modelLoaderManager.loadFromFile(file)
      this.sceneManager.instance.add(model)
      console.log('[Vortex3D Core] Local model added to scene.')
    } catch (error) {
      console.error('[Vortex3D Core] Error loading local model.', error)
    }
  }

  private onWindowResize = () => {
    const { clientWidth, clientHeight } = this.container
    this.eventBus.emit('resize', clientWidth, clientHeight)
  }

  public dispose() {
    console.log('[Vortex3D Core] Starting engine disposal pipeline...')
    window.removeEventListener('resize', this.onWindowResize)

    this.rendererManager.dispose()
    this.cameraManager.dispose()
    this.sceneManager.dispose()
    this.modelLoaderManager.dispose()

    this.eventBus.clear()
    this.container.innerHTML = ''
  }
}
