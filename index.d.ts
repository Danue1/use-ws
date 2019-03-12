import { ConsumerProps, ExoticComponent, FC } from 'react'

export enum BinaryType {
  ArrayBuffer = 'arraybuffer',
  Blob = 'blob'
}

type BinaryKind = 'arraybuffer' | 'blob'

export const createWebSocket: <Binary extends BinaryKind>(
  option: Option<Binary>
) => {
  readonly useWebSocket: () => WebSocketContext
  readonly WebSocketConsumer: ExoticComponent<ConsumerProps<WebSocketContext>>
  readonly WebSocketProvider: FC<Props>
}

export interface Option<Binary extends BinaryKind> {
  readonly binaryType: Binary
  readonly serialize: Serialize
  readonly deserialize: Deserialize<Binary>
}

export type Serialize = (action: any, ...args: any[]) => string | ArrayBufferLike | Blob | ArrayBufferView
export type Deserialize<Binary extends BinaryKind> = (
  packet: string | (Binary extends 'arraybuffer' ? ArrayBuffer : Blob)
) => void | SerializedPacket
export interface SerializedPacket {
  readonly action: any
  readonly data: any[]
}

export interface WebSocketContext {
  readonly removeListener: RemoveListener
  readonly addListener: AddListener
  readonly once: Once
  readonly emit: Emit
  readonly reconnect: Reconnect
}

export type Handler = (...args: any[]) => void
export type Handle = (action: any, handler: Handler) => WebSocketContext
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
