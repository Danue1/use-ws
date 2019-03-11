import React, { FC } from 'react'
import { WebSocketProvider } from './Components/WebSocket'
import { User } from './User'

export const App: FC = () => (
  <WebSocketProvider url="ws://localhost">
    <User />
  </WebSocketProvider>
)
