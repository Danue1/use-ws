import { createWebSocket, Decode, Encode, DecodedPacket } from '../../index'

const encode: Encode = (action, data) => {
  return JSON.stringify([action, data])
}

const decode: Decode = packet => {
  try {
    const decodedPacket = JSON.parse(new Uint8Array(packet).join(''))
    if (Array.isArray(decodedPacket)) {
      const [action, ...data] = decodedPacket
      return { action, data }
    } else {
      return {} as DecodedPacket
    }
  } catch {
    return {} as DecodedPacket
  }
}

const websocket = createWebSocket({ encode, decode })

export const WebSocketProvider = websocket.Provider
export const useWebSocket = websocket.useWebSocket
