// packages/core/src/index.ts
export class VortexEngine {
  private container: HTMLElement

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) {
      throw new Error(
        `[Vortex3D] Specified DOM container not found: ${containerId}`
      )
    }
    this.container = el
    console.log(
      '[Vortex3D Core] Engine instance successfully mounted! DOM Node:',
      this.container
    )
  }

  public init() {
    console.log('[Vortex3D Core] Initializing rendering pipeline...')
  }

  public dispose() {
    console.log('[Vortex3D Core] Disposing engine, releasing memory...')
    this.container.innerHTML = ''
  }
}
