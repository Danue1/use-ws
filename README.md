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
import { createWebSocket } from 'use-ws'

const { WebSocketProvider, useWebSocket } = createWebSocket({
  binaryType: 'arraybuffer', // or 'blob'
  encode(action, ...data) { ... },
  decode(packet) { ... }
})

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
  const [name, setName] = useState<string>('')

  useEffect(() => {
    const handler = (foo: string, bar?: number) => { ... }

    websocket
      .receive(YOUR_ACTION_CODE, handler)
      .request(YOUR_ACTION_CODE)

    return () => {
      websocket.remove(YOUR_ACTION_CODE, handler)
    }
  }, [])

  return <div>{name}</div>
}

ReactDOM.render(<App />, document.getElementById('root'))
```

# Lince

[MIT](./LICENSE)
