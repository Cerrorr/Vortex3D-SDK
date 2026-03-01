import { WebGLRenderer, Scene, PerspectiveCamera } from 'three'
import { EventBus } from '../utils/EventBus'

export class RendererManager {
  public instance: WebGLRenderer
  private animationFrameId: number | null = null
  private eventBus: EventBus

  constructor(container: HTMLElement, eventBus: EventBus) {
    this.eventBus = eventBus
    const { clientWidth, clientHeight } = container

    this.instance = new WebGLRenderer({ antialias: true })
    this.instance.setSize(clientWidth, clientHeight)
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.instance.domElement.setAttribute(
      'data-engine',
      'Vortex3D Engine v1.0.0'
    )
    container.appendChild(this.instance.domElement)

    this.eventBus.on('resize', this.onResize)
  }

  // 去掉 onUpdate 回调参数
  public startLoop(scene: Scene, camera: PerspectiveCamera) {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render)

      // 广播即将渲染
      this.eventBus.emit('beforeRender')

      this.instance.render(scene, camera)
    }
    render()
  }

  private onResize = (width: number, height: number) => {
    this.instance.setSize(width, height)
  }

  public dispose() {
    console.log('[RendererManager] Disposing renderer...')
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.eventBus.off('resize', this.onResize)
    this.instance.dispose()
    this.instance.forceContextLoss()
  }
}
