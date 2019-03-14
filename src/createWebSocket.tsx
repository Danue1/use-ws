import * as React from 'react'
import { EventEmitter } from 'eventemitter3'
import { createContext, useContext, useEffect, useState, FC } from 'react'

export type Action = string | number

export type BinaryKind = 'arraybuffer' | 'blob'

export interface Option<BK extends BinaryKind> {
  readonly binaryType: BK
  readonly serialize: Serialize
  readonly deserialize: Deserialize<BK>
}

export type Packet = string | ArrayBufferLike | Blob | ArrayBufferView
export type Serialize = (action: Action, ...data: any[]) => Packet
export type Deserialize<BK extends BinaryKind> = (
  packet: string | (BK extends 'arraybuffer' ? ArrayBuffer : Blob)
) => void | SerializedPacket
export interface SerializedPacket {
  readonly action: Action
  readonly data: any[]
}

export interface WebSocketContext {
  readonly removeListener: RemoveListener
  readonly addListener: AddListener
  readonly once: Once
  readonly emit: Emit
  readonly reconnect: Reconnect
}

export type Handler = (...data: any[]) => void
export type Handle = (action: Action, handler: Handler) => WebSocketContext
export type RemoveListener = Handle
export type AddListener = Handle
export type Once = Handle
export type Emit = (...data: any[]) => WebSocketContext
export type Reconnect = () => void

export interface Props {
  readonly url: string
  readonly middleware?: Middleware
  readonly onOpen?: OnOpen
  readonly onError?: OnError
  readonly onClose?: OnClose
}

export type Middleware = (action: string, ...data: any[]) => void
export type OnOpen = (event: Event) => void
export type OnError = (event: Event) => void
export type OnClose = (event: CloseEvent) => void

export const createWebSocket = <BK extends BinaryKind>({ binaryType, serialize, deserialize }: Option<BK>) => {
  const Context = createContext<WebSocketContext>({} as WebSocketContext)
  const event = new EventEmitter()
  const pendingQueue: Packet[] = []

  const useWebSocket = () => useContext(Context)

  const WebSocketProvider: FC<Props> = ({ url, middleware, onOpen, onError = () => {}, onClose, children }) => {
    const [currentWebSocket, setCurrentWebSocket] = useState<null | WebSocket>(null)

    const createWebSocket = () => {
      if (currentWebSocket) {
        return
      }
      const nextWebSocket = new WebSocket(url)
      nextWebSocket.binaryType = binaryType
      nextWebSocket.onerror = onError
      nextWebSocket.onclose = () => {
        nextWebSocket.onmessage = null
        nextWebSocket.onerror = null
        onOpen && nextWebSocket.removeEventListener('open', onOpen)
        onClose && nextWebSocket.removeEventListener('close', onClose)
      }
      onClose && nextWebSocket.addEventListener('close', onClose)

      nextWebSocket.onmessage = ({ data: packet }) => {
        const decodedPacket = deserialize(packet)
        const { action, data } = decodedPacket || ({} as SerializedPacket)
        if (!action) {
          return
        }
        if (middleware) {
          middleware(action as string, ...data)
        }
        event.emit(action as string, ...data)
      }
      nextWebSocket.onopen = () => {
        pendingQueue.forEach(packet => nextWebSocket.send(packet))
        setCurrentWebSocket(nextWebSocket)
      }
      if (onOpen) {
        nextWebSocket.addEventListener('open', onOpen)
      }
    }
    useEffect(createWebSocket, [currentWebSocket])

    const isBroadcastable = () => !!currentWebSocket && currentWebSocket.readyState === currentWebSocket.OPEN
    const context: WebSocketContext = {
      removeListener(action, handler) {
        event.removeListener(action as string, handler)
        return this
      },
      addListener(action, handler) {
        event.addListener(action as string, handler)
        return this
      },
      once(action, handler) {
        event.once(action as string, handler)
        return this
      },
      emit(action, ...data) {
        const packet = serialize(action, ...data)
        if (isBroadcastable()) {
          currentWebSocket!.send(packet)
        } else {
          pendingQueue.push(packet)
        }
        return this
      },
      reconnect() {
        if (isBroadcastable()) {
          currentWebSocket!.close()
        }
        setCurrentWebSocket(null)
      }
    }

    return <Context.Provider value={context}>{children}</Context.Provider>
  }

  return {
    useWebSocket,
    WebSocketConsumer: Context.Consumer,
    WebSocketProvider
  }
}
