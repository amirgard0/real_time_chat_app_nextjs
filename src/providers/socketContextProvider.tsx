"use client"

import { useSocket } from "@/hooks/useSocket"
import { Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import React, { createContext } from "react"
import { DefaultEventsMap } from "socket.io"
import { Session } from "next-auth"

interface context {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
  isConnected: boolean,
  status: "authenticated" | "loading" | "unauthenticated"
  session: Session | null
}

// In your provider file
export const SocketSessionContext = createContext<context>({
  socket: null,
  isConnected: false,
  status: "loading",
  session: null
})

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { socket, isConnected } = useSocket(session);

  return (
    <SocketSessionContext.Provider value={{ socket, isConnected, status, session }}>
      {children}
    </SocketSessionContext.Provider>
  )
}