import { createWebSocket, Decode, Encode, PacketType } from '../../index'

const encode: Encode = (action, data) => {
  return JSON.stringify([action, data])
}

const decode: Decode<PacketType.ArrayBuffer> = packet => {
  const schrodingeredPacket = typeof packet === 'string' ? packet : new Uint8Array(packet).join('')
  const { action, data } = JSON.parse(schrodingeredPacket)
  return { action, data }
}

const websocket = createWebSocket({ binaryType: PacketType.ArrayBuffer, encode, decode })

export const WebSocketProvider = websocket.Provider
export const useWebSocket = websocket.useWebSocket
