import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  Box3,
  Vector3,
  Scene
} from 'three'
import { EventBus } from '../utils/EventBus'

/**
 * 灯光管理类
 * 负责场景中所有光源的初始化、销毁以及根据模型大小进行的动态适配
 */
export class LightingManager {
  private eventBus: EventBus
  private scene: Scene

  private ambientLight!: AmbientLight
  private mainLight!: DirectionalLight
  private hemisphereLight!: HemisphereLight

  constructor(scene: Scene, eventBus: EventBus) {
    this.scene = scene
    this.eventBus = eventBus

    this.initLights()
  }

  /**
   * 初始化工业级三点照明系统
   */
  private initLights() {
    // 1. 半球光：模拟自然的光照环境（天空色与地面色），提升暗部质感
    this.hemisphereLight = new HemisphereLight(0xffffff, 0x444444, 1.0)
    this.scene.add(this.hemisphereLight)

    // 2. 环境光：提供基础的全局亮度，确保模型没有绝对的黑色死角
    this.ambientLight = new AmbientLight(0xffffff, 0.5)
    this.scene.add(this.ambientLight)

    // 3. 主方向光：模拟主光源（如阳光），用于产生体积感和明暗对比
    this.mainLight = new DirectionalLight(0xffffff, 2.0)
    this.mainLight.position.set(5, 10, 7.5)
    this.scene.add(this.mainLight)

    console.log('[LightingManager] Industrial lights initialized.')
  }

  /**
   * 根据模型的包围盒动态调整灯光位置
   * @param object 需要光照适配的目标模型
   */
  public adjustToModel(object: Object3D) {
    // 计算模型的包围盒
    const box = new Box3().setFromObject(object)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // 获取模型的最大尺寸
    const maxDim = Math.max(size.x, size.y, size.z)

    // 动态调整主光源位置，使其与模型大小保持比例，并指向模型中心
    this.mainLight.position.set(
      center.x + maxDim,
      center.y + maxDim,
      center.z + maxDim
    )
    this.mainLight.target = object

    console.log(
      `[LightingManager] Lights adjusted for model size: ${maxDim.toFixed(2)}`
    )

    // 通过总线向其他管家（如相机）广播模型包围盒信息，便于后续自动对焦
    this.eventBus.emit('modelBoundsCalculated', { center, maxDim })
  }

  /**
   * 销毁灯光资源
   */
  public dispose() {
    console.log('[LightingManager] Disposing lights.')
    this.ambientLight.dispose()
    this.mainLight.dispose()
    this.hemisphereLight.dispose()
  }
}
