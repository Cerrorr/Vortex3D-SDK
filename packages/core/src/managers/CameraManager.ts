import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { gsap } from 'gsap'
import { EventBus } from '../utils/EventBus'

/**
 * 相机管理类
 * 集成了轨道控制器交互与 GSAP 丝滑对焦动画
 */
export class CameraManager {
  public instance: PerspectiveCamera
  public controls: OrbitControls
  private eventBus: EventBus

  constructor(
    container: HTMLElement,
    rendererDom: HTMLCanvasElement,
    eventBus: EventBus
  ) {
    this.eventBus = eventBus
    const { clientWidth, clientHeight } = container

    // 初始化相机
    this.instance = new PerspectiveCamera(
      75,
      clientWidth / clientHeight,
      0.1,
      2000
    )
    this.instance.position.set(5, 5, 5)

    // 初始化轨道控制器
    this.controls = new OrbitControls(this.instance, rendererDom)
    // 启用阻尼效果，让旋转更丝滑
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.screenSpacePanning = true

    // 监听事件
    this.eventBus.on('resize', this.onResize)
    this.eventBus.on('modelBoundsCalculated', this.smoothAutoFocus)
    this.eventBus.on('beforeRender', this.update)
  }

  /**
   * 平滑自动对焦逻辑
   * 使用 GSAP 实现位置和观察点的丝滑过渡
   */
  private smoothAutoFocus = (data: { center: Vector3; maxDim: number }) => {
    const { center, maxDim } = data

    // 计算理想距离
    const fovRad = (this.instance.fov * Math.PI) / 180
    let distance = maxDim / (2 * Math.tan(fovRad / 2))

    if (this.instance.aspect < 1) {
      distance = distance / this.instance.aspect
    }

    const finalDistance = distance * 1.5

    // 计算目标位置
    const targetPosition = new Vector3(
      center.x + finalDistance * 0.5,
      center.y + finalDistance * 0.5,
      center.z + finalDistance
    )

    // 使用 GSAP 执行相机位置动画
    gsap.to(this.instance.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        // 动画过程中实时更新相机看向的点
        this.instance.lookAt(center)
      }
    })

    // 同时平滑过渡控制器的中心点
    gsap.to(this.controls.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        console.log('[CameraManager] Smooth auto-focus completed.')
      }
    })
  }

  /**
   * 每一帧更新控制器状态
   */
  private update = () => {
    if (this.controls.enableDamping) {
      this.controls.update()
    }
  }

  private onResize = (width: number, height: number) => {
    this.instance.aspect = width / height
    this.instance.updateProjectionMatrix()
  }

  public dispose() {
    console.log('[CameraManager] Disposing camera and controls.')
    this.eventBus.off('resize', this.onResize)
    this.eventBus.off('modelBoundsCalculated', this.smoothAutoFocus)
    this.eventBus.off('beforeRender', this.update)
    this.controls.dispose()
    gsap.killTweensOf(this.instance.position)
    gsap.killTweensOf(this.controls.target)
  }
}
