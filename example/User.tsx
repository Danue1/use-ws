import React, { FC, useEffect, useState } from 'react'
import { useWebSocket } from './Components/WebSocket'

export const User: FC = () => {
  const websocket = useWebSocket()
  const [name, setName] = useState<string>('')

  useEffect(() => {
    const GetUserName = 'GetUserName'
    const Action = GetUserName
    const getUserName = (name: string) => {
      setName(name)
    }

    websocket.receiveOnce(Action, getUserName).request(Action)

    return () => {
      websocket.remove(Action, getUserName)
    }
  }, [])

  return <div>{name}</div>
}
