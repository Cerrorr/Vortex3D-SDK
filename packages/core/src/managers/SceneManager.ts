import { Scene, Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { EventBus } from '../utils/EventBus';

export class SceneManager {
  public instance: Scene;
  private testCube: Mesh | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.instance = new Scene();
    this.instance.background = new Color(0x1a1a1a);
    this.addTestCube();

    // 监听渲染前事件
    this.eventBus.on('beforeRender', this.update);
  }

  private addTestCube() {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    this.testCube = new Mesh(geometry, material);
    this.instance.add(this.testCube);
  }

  // 改为箭头函数，确保 eventBus 调用时 this 指向 SceneManager 本身
  private update = () => {
    if (this.testCube) {
      this.testCube.rotation.x += 0.01;
      this.testCube.rotation.y += 0.01;
    }
  }

  public dispose() {
    console.log('[SceneManager] Disposing scene resources...');
    
    // 务必解绑事件
    this.eventBus.off('beforeRender', this.update);
    
    if (this.testCube) {
      this.testCube.geometry.dispose();
      (this.testCube.material as MeshBasicMaterial).dispose();
      this.instance.remove(this.testCube);
      this.testCube = null;
    }
  }
}