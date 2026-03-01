import { PerspectiveCamera } from 'three'
import { EventBus } from '../utils/EventBus'

export class CameraManager {
  public instance: PerspectiveCamera
  private eventBus: EventBus

  constructor(container: HTMLElement, eventBus: EventBus) {
    this.eventBus = eventBus
    const { clientWidth, clientHeight } = container

    this.instance = new PerspectiveCamera(
      75,
      clientWidth / clientHeight,
      0.1,
      1000
    )
    this.instance.position.z = 5

    // 监听由总线发出的尺寸改变事件
    this.eventBus.on('resize', this.onResize)
  }

  private onResize = (width: number, height: number) => {
    this.instance.aspect = width / height
    this.instance.updateProjectionMatrix()
  }

  public dispose() {
    // 务必解绑事件，防止内存泄漏
    this.eventBus.off('resize', this.onResize)
  }
}
