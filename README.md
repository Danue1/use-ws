# use-ws

A pretty custom hooks for websocket and react.

- type-safe!

# Install

```cmd
// npm
npm install --save use-ws

// yarn
yarn add use-ws
```

# Usage

```tsx
import React, { FC, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { createWebSocket, BinaryType } from 'use-ws'

const WebSocket = createWebSocket({
  // required
  binaryType: BinaryType.ArrayBuffer, // or BinaryType.Blob
  serialize(action, ...data) { ... },
  deserialize(packet) { ... },
  // optional
  heartbeat: {
    interval: 10 * 1000,
    action: YOUR_HEARTBEAT_CODE,
    data: [] // optional
  }
})
const { WebSocketProvider, WebSocketContext, useWebSocket, useHeartbeat } = WebSocket

const App: FC = () => (
  <WebSocketProvider
    url={YOUR_WEBSOCKET_URL}
    middleware={(action, ...data) => { ... }}
    onOpen={event => { ... }}
    onError={event => { ... }}
    onClose={event => { ... }}
  >
    <User />
  </WebSocketProvider>
)

const User: FC = () => {
  const websocket = useWebSocket()
  const { latestHeartbeat, setData, setNextDelay } = useHeartbeat()
  const [id, setId] = useState<string>('')
  const [name, setName] = useState<string>('')

  // listener settings
  useEffect(() => {
    const handler = (foo: string, bar?: number) => { ... }

    websocket.addListener(YOUR_ACTION_CODE, handler)
    websocket.once(YOUR_ACTION_CODE, handler)
    websocket.emit(parameter0, parameter1)

    return () => {
      websocket.removeListener(YOUR_ACTION_CODE, handler)
    }
  }, [])

  // add 100ms per heartbeat
  useEffect(() => {
    setNextDelay(previousDelay => {
      const nextDelay = previousDelay + 100
      setData(nextDelay)
      return nextDelay
    })
  }, [latestHeartbeat])

  return <div>{name}</div>
}

ReactDOM.render(<App />, document.getElementById('root'))
```

# Lincense

[MIT](./LICENSE)
