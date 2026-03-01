import { Group, LoadingManager } from 'three'
// 👉 Using the modern addons path
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { EventBus } from '../utils/EventBus'

export class ModelLoaderManager {
  private eventBus: EventBus
  private manager: LoadingManager
  private dracoPath: string

  private gltfLoader: GLTFLoader | null = null
  private fbxLoader: FBXLoader | null = null

  constructor(eventBus: EventBus, dracoPath: string) {
    this.eventBus = eventBus
    this.dracoPath = dracoPath

    this.manager = new LoadingManager()
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100
      this.eventBus.emit('modelLoadProgress', progress, url)
    }

    this.manager.onError = (url) => {
      console.error(`[ModelLoaderManager] Error loading resource: ${url}`)
      this.eventBus.emit('modelLoadError', url)
    }
  }

  private getGLTFLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader(this.manager)
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(this.dracoPath)
      this.gltfLoader.setDRACOLoader(dracoLoader)
    }
    return this.gltfLoader
  }

  private getFBXLoader(): FBXLoader {
    if (!this.fbxLoader) {
      this.fbxLoader = new FBXLoader(this.manager)
    }
    return this.fbxLoader
  }

  public async loadFromURL(url: string, extension?: string): Promise<Group> {
    const ext = extension || url.split('.').pop()?.toLowerCase()
    return new Promise((resolve, reject) => {
      try {
        if (ext === 'gltf' || ext === 'glb') {
          this.getGLTFLoader().load(
            url,
            (gltf) => resolve(gltf.scene),
            undefined,
            reject
          )
        } else if (ext === 'fbx') {
          this.getFBXLoader().load(
            url,
            (fbx) => resolve(fbx),
            undefined,
            reject
          )
        } else {
          reject(
            new Error(`[ModelLoaderManager] Unsupported file extension: ${ext}`)
          )
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  public async loadFromFile(file: File): Promise<Group> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension)
      throw new Error(
        '[ModelLoaderManager] Unable to determine file extension from file name.'
      )

    const blobUrl = URL.createObjectURL(file)
    try {
      console.log(
        `[ModelLoaderManager] Starting local file parsing: ${file.name}`
      )
      const model = await this.loadFromURL(blobUrl, extension)
      console.log(
        `[ModelLoaderManager] Local file parsing completed: ${file.name}`
      )
      return model
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  }

  public dispose() {
    console.log('[ModelLoaderManager] Disposing loaders...')
    this.gltfLoader = null
    this.fbxLoader = null
  }
}
