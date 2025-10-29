declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillInit {
    headers?: Record<string, string>
    withCredentials?: boolean
    heartbeatTimeout?: number
    connectionTimeout?: number
  }

  export class EventSourcePolyfill extends EventSource {
    constructor(url: string, eventSourceInitDict?: EventSourcePolyfillInit)
    onmessage: ((event: MessageEvent) => void) | null
    onerror: ((event: Event) => void) | null
    onopen: ((event: Event) => void) | null
    close(): void
  }
}

