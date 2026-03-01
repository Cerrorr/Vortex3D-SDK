import { GridHelper, Scene, AxesHelper } from 'three';
import { EventBus } from '../utils/EventBus';

/**
 * 辅助器管理类
 * 负责场景中的网格、坐标轴等开发辅助工具的显示与隐藏
 */
export class HelperManager {
  private scene: Scene;
  private eventBus: EventBus;
  
  private gridHelper: GridHelper;
  private axesHelper: AxesHelper;

  constructor(scene: Scene, eventBus: EventBus) {
    this.scene = scene;
    this.eventBus = eventBus;

    // 1. 初始化网格 (大小 100, 细分 100, 颜色深浅交替)
    this.gridHelper = new GridHelper(100, 100, 0x444444, 0x222222);
    this.scene.add(this.gridHelper);

    // 2. 初始化坐标轴 (长 5)
    this.axesHelper = new AxesHelper(5);
    this.scene.add(this.axesHelper);

    console.log('[HelperManager] Grid and Axes helpers initialized.');
  }

  /**
   * 切换网格可见性
   * @param visible 是否显示
   */
  public toggleGrid(visible: boolean) {
    this.gridHelper.visible = visible;
    console.log(`[HelperManager] Grid visibility set to: ${visible}`);
  }

  /**
   * 切换坐标轴可见性
   * @param visible 是否显示
   */
  public toggleAxes(visible: boolean) {
    this.axesHelper.visible = visible;
  }

  /**
   * 销毁资源
   */
  public dispose() {
    console.log('[HelperManager] Disposing helpers.');
    this.scene.remove(this.gridHelper);
    this.scene.remove(this.axesHelper);
    this.gridHelper.dispose();
  }
}