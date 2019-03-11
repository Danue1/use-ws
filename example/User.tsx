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

    websocket.messageOnce(Action, getUserName).broadcast(Action)

    return () => {
      websocket.clear(Action, getUserName)
    }
  }, [])

  return <div>{name}</div>
}
