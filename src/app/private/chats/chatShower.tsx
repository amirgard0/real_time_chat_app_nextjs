//src/app/private/chats/chatShower.tsx

"use client"

import { PrivateChat } from "@/components/custom/privateChat";
import { SocketSessionContext } from "@/providers/socketContextProvider";
import { useSearchParams } from "next/navigation";
import { useContext } from "react";

export const ChatShower = () => {
  const { session, isConnected, status, socket } = useContext(SocketSessionContext)
  console.log(session, isConnected, status, socket)
  const searchParams = useSearchParams()
  const privateChatId = searchParams.get("privateChatId")
  if (!privateChatId) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">
      <p className="text-lg">Select a chat to start messaging</p>
    </div>
  }
  return (
    <div className="w-full">
      <PrivateChat
        isConnected={isConnected}
        status={status}
        socket={socket}
        session={session}
        privateChatId={privateChatId}
      />
    </div>
  );
}