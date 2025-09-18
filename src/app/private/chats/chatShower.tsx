"use client"

import { PrivateChat } from "@/components/custom/privateChat";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export const ChatShower = () => {
  const { data: session, status } = useSession();
  const { socket, isConnected } = useSocket(session);
  const searchParams = useSearchParams()
  const privateChatId = searchParams.get("privateChatId")
  if (!privateChatId) {
    return
  }
  return <div>
    <PrivateChat isConnected={isConnected} status={status} socket={socket} session={session} privateChatId={privateChatId} />
  </div>
}