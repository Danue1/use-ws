import { EventEmitter } from 'eventemitter3'
import React, { createContext, useContext, useEffect, useState, createElement } from 'react'

export const createWebSocket = ({ encode, decode }) => {
  const Context = createContext({})

  const event = new EventEmitter()
  const broadcastStack = []

  const Provider = ({
    url,
    middleware,
    onError = () => {
      //
    },
    onClose = () => {
      //
    },
    children
  }) => {
    const [currentWebSocket, setCurrentWebSocket] = useState(null)

    const createWebSocket = () => {
      if (currentWebSocket) {
        return
      }

      const nextWebSocket = new WebSocket(url)
      nextWebSocket.binaryType = 'arraybuffer'

      nextWebSocket.onerror = onError
      nextWebSocket.onclose = onClose
      nextWebSocket.onmessage = ({ data }) => {
        const [action, ...args] = decode(data)
        if (middleware) {
          middleware(action, ...args)
        }
        event.emit(action, ...args)
      }
      nextWebSocket.onopen = () => {
        broadcastStack.forEach(packet => nextWebSocket.send(packet))
        setCurrentWebSocket(nextWebSocket)
      }
    }

    useEffect(createWebSocket, [currentWebSocket])

    const isBroadcastable = () => !!currentWebSocket && currentWebSocket.readyState === currentWebSocket.OPEN

    const context = {
      clear(action, handler) {
        event.removeListener(action, handler)
        return this
      },
      message(action, handler) {
        event.addListener(action, handler)
        return this
      },
      messageOnce(action, handler) {
        event.once(action, handler)
        return this
      },
      broadcast(...data) {
        const packet = encode(...data)
        if (isBroadcastable()) {
          currentWebSocket.send(packet)
        } else {
          broadcastStack.push(packet)
        }
        return this
      },
      refresh() {
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
    Consumer: Context.Consumer,
    Provider
  }
}
