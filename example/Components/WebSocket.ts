import { createWebSocket, Decode, Encode } from '../../src'

const encode: Encode = (action, data) => {
  return Buffer.from(JSON.stringify([action, data]))
}

const decode: Decode = data => {
  try {
    const packet = JSON.parse(new Uint8Array(data).join(''))
    if (Array.isArray(packet)) {
      return packet
    } else {
      return []
    }
  } catch {
    return []
  }
}

const websocket = createWebSocket({ encode, decode })

export const WebSocketProvider = websocket.Provider
export const useWebSocket = websocket.useWebSocket
