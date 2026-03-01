import { LoadingManager, Mesh, MeshStandardMaterial, Object3D } from 'three'
// 基于 r182/r183 的标准 addons 路径
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { EventBus } from '../utils/EventBus'

/**
 * 模型加载管理类
 * 负责处理多种格式（GLTF, FBX, OBJ, STL）的资源加载，并统一分发加载状态
 */
export class ModelLoaderManager {
  private eventBus: EventBus
  private manager: LoadingManager
  private dracoPath: string

  // 延迟初始化加载器实例，节省初始内存
  private gltfLoader: GLTFLoader | null = null
  private fbxLoader: FBXLoader | null = null
  private objLoader: OBJLoader | null = null
  private stlLoader: STLLoader | null = null

  constructor(eventBus: EventBus, dracoPath: string) {
    this.eventBus = eventBus
    this.dracoPath = dracoPath

    // 初始化 Three.js 统一加载管理器
    this.manager = new LoadingManager()

    // 监听加载开始
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.eventBus.emit('modelLoadStart', { url, itemsLoaded, itemsTotal })
    }

    // 监听加载进度并转换为百分比
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100
      this.eventBus.emit('modelLoadProgress', progress, url)
    }

    // 监听加载错误
    this.manager.onError = (url) => {
      console.error(`[ModelLoaderManager] Error loading resource: ${url}`)
      this.eventBus.emit('modelLoadError', url)
    }
  }

  /**
   * GLTFLoader
   * 包含 Draco 压缩解码器的私有化配置
   */
  private getGLTFLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader(this.manager)
      const dracoLoader = new DRACOLoader()
      // 使用初始化时传入的私有化 WASM 解码器路径
      dracoLoader.setDecoderPath(this.dracoPath)
      this.gltfLoader.setDRACOLoader(dracoLoader)
    }
    return this.gltfLoader
  }

  /**
   * FBXLoader
   */
  private getFBXLoader(): FBXLoader {
    if (!this.fbxLoader) this.fbxLoader = new FBXLoader(this.manager)
    return this.fbxLoader
  }

  /**
   * OBJLoader
   */
  private getOBJLoader(): OBJLoader {
    if (!this.objLoader) this.objLoader = new OBJLoader(this.manager)
    return this.objLoader
  }

  /**
   * STLLoader
   */
  private getSTLLoader(): STLLoader {
    if (!this.stlLoader) this.stlLoader = new STLLoader(this.manager)
    return this.stlLoader
  }

  /**
   * 通过 URL 加载模型的主入口
   * @param url 模型资源地址
   * @param extension 强制指定后缀（可选）
   */
  public async loadFromURL(url: string, extension?: string): Promise<Object3D> {
    // 自动解析后缀名并转为小写
    const ext = extension || url.split('.').pop()?.toLowerCase()

    return new Promise((resolve, reject) => {
      try {
        switch (ext) {
          case 'gltf':
          case 'glb':
            this.getGLTFLoader().load(
              url,
              (gltf) => resolve(gltf.scene),
              undefined,
              reject
            )
            break
          case 'fbx':
            this.getFBXLoader().load(
              url,
              (fbx) => resolve(fbx),
              undefined,
              reject
            )
            break
          case 'obj':
            this.getOBJLoader().load(
              url,
              (obj) => resolve(obj),
              undefined,
              reject
            )
            break
          case 'stl':
            this.getSTLLoader().load(
              url,
              (geometry) => {
                // STL 仅返回几何体，此处手动包装为 Mesh 以保持引擎返回类型的一致性
                const mesh = new Mesh(
                  geometry,
                  new MeshStandardMaterial({ color: 0x888888 })
                )
                resolve(mesh)
              },
              undefined,
              reject
            )
            break
          default:
            reject(
              new Error(`[ModelLoaderManager] Unsupported extension: ${ext}`)
            )
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 加载本地 File 对象 (用于用户上传场景)
   * @param file 浏览器原生 File 对象
   */
  public async loadFromFile(file: File): Promise<Object3D> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension) {
      throw new Error('[ModelLoaderManager] No file extension found.')
    }

    // 将本地文件转换为临时内存 Blob URL
    const blobUrl = URL.createObjectURL(file)
    try {
      console.log(`[ModelLoaderManager] Parsing local file: ${file.name}`)
      const model = await this.loadFromURL(blobUrl, extension)
      return model
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  }

  /**
   * 销毁方法
   * 清空加载器引用，便于垃圾回收
   */
  public dispose() {
    console.log('[ModelLoaderManager] Disposing loaders.')
    this.gltfLoader = null
    this.fbxLoader = null
    this.objLoader = null
    this.stlLoader = null
  }
}
