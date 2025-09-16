"use client"

import { PrivateChat } from "@/components/custom/privateChat";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";

export default () => {
  const { data: session, status } = useSession();
  const { socket, isConnected } = useSocket(session);

  return <PrivateChat isConnected={isConnected} session={session} socket={socket} status={status} />
}