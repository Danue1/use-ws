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
  readonly encode: Encode
  readonly decode: Decode<Binary>
}

export type Encode = (action: any, ...args: any[]) => string | ArrayBufferLike | Blob | ArrayBufferView
export type Decode<Binary extends BinaryKind> = (
  packet: string | (Binary extends 'arraybuffer' ? ArrayBuffer : Blob)
) => void | DecodedPacket
export interface DecodedPacket {
  readonly action: any
  readonly data: any[]
}

export interface WebSocketContext {
  readonly remove: Remove
  readonly receive: Receive
  readonly receiveOnce: ReceiveOnce
  readonly request: Request
  readonly refresh: Refresh
}

export type Handler = (...args: any[]) => void
export type Handle = (action: any, handler: Handler) => WebSocketContext
export type Remove = Handle
export type Receive = Handle
export type ReceiveOnce = Handle
export type Request = (...data: any[]) => WebSocketContext
export type Refresh = () => void

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
