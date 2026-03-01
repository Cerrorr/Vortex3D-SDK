import { Scene, Color } from 'three'
import { EventBus } from '../utils/EventBus'

/**
 * 场景管理类
 * 仅负责场景图容器的初始化、背景配置及全局更新逻辑
 */
export class SceneManager {
  public instance: Scene
  private eventBus: EventBus

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.instance = new Scene()
    this.instance.background = new Color(0x1a1a1a)

    // 注册渲染更新事件
    this.eventBus.on('beforeRender', this.update)
  }

  /**
   * 场景每帧更新逻辑
   */
  private update = () => {
    // 此处可添加全局场景动画，如背景色渐变等
  }

  /**
   * 释放场景资源
   */
  public dispose() {
    console.log('[SceneManager] Disposing scene.')
    this.eventBus.off('beforeRender', this.update)
    // 清空场景中所有的物体
    this.instance.clear()
  }
}
