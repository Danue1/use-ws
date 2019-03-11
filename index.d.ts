import { ExoticComponent, ConsumerProps } from 'react'

export type Packet = string | ArrayBufferLike | Blob | ArrayBufferView
export type Encode = (action: any, ...args: any[]) => Packet
export type Decode = (packet: ArrayBuffer) => DecodedPacket
export interface DecodedPacket {
  readonly action: any
  readonly data: any[]
}

export interface Option {
  readonly encode: Encode
  readonly decode: Decode
}

export type Middleware = (action: string, ...data: any[]) => void
export type OnError = (event: Event) => void
export type OnClose = (event: CloseEvent) => void

export interface Props {
  readonly url: string
  readonly middleware?: Middleware
  readonly onError?: OnError
  readonly onClose?: OnClose
}

export type Handler = (...args: any[]) => void
export type Handle = (action: any, handler: Handler) => Context
export type Clear = Handle
export type message = Handle
export type messageOnce = Handle
export type Broadcast = (...data: any[]) => Context
export type Refresh = () => void

export interface Context {
  readonly clear: Clear
  readonly message: message
  readonly messageOnce: messageOnce
  readonly broadcast: Broadcast
  readonly refresh: Refresh
}

export const createWebSocket: (
  option: Option
) => {
  readonly useWebSocket: () => Context
  readonly Consumer: ExoticComponent<ConsumerProps<Context>>
  readonly Provider: FC<Props>
}
