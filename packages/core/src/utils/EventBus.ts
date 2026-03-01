// packages/core/src/utils/EventBus.ts
type EventHandler = (...args: any[]) => void

export class EventBus {
  private listeners: Record<string, EventHandler[]> = {}

  /**
   * Subscribe to an event
   */
  public on(event: string, callback: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback: EventHandler) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    )
  }

  /**
   * Emit an event with optional arguments
   */
  public emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`[EventBus] Error executing event '${event}':`, error)
      }
    })
  }

  /**
   * Clear all events (crucial for memory management)
   */
  public clear() {
    this.listeners = {}
  }
}
