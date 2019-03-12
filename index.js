import { EventEmitter } from 'eventemitter3'
import { createContext, useContext, useEffect, useState, createElement } from 'react'

export const BinaryType = {
  ArrayBuffer: 'arraybuffer',
  Blob: 'blob'
}

export const createWebSocket = ({ binaryType, serialize, deserialize }) => {
  const Context = createContext({})
  const event = new EventEmitter()
  const pendingQueue = []
  const Provider = ({ url, middleware, onOpen, onError = () => {}, onClose, children }) => {
    const [currentWebSocket, setCurrentWebSocket] = useState(null)

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
        nextWebSocket.removeEventListener('open', onOpen)
        nextWebSocket.removeEventListener('close', onClose)
      }
      if (onClose) {
        nextWebSocket.addEventListener('close', onClose)
      }
      nextWebSocket.onmessage = ({ data: packet }) => {
        const decodedPacket = deserialize(packet)
        const { action, data } = decodedPacket || {}
        if (!action) {
          return
        }
        if (middleware) {
          middleware(action, ...data)
        }
        event.emit(action, ...data)
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
    const context = {
      removeListener(action, handler) {
        event.removeListener(action, handler)
        return this
      },
      addListener(action, handler) {
        event.addListener(action, handler)
        return this
      },
      once(action, handler) {
        event.once(action, handler)
        return this
      },
      emit(action, ...data) {
        const packet = serialize(action, ...data)
        if (isBroadcastable()) {
          currentWebSocket.send(packet)
        } else {
          pendingQueue.push(packet)
        }
        return this
      },
      reconnect() {
        if (isBroadcastable()) {
          currentWebSocket.close()
        }
        setCurrentWebSocket(null)
      }
    }

    return createElement(Context.Provider, { value: context }, children)
  }

  return {
    useWebSocket: () => useContext(Context),
    WebSocketConsumer: Context.Consumer,
    WebSocketProvider: Provider
  }
}
