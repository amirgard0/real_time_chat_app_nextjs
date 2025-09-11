// src/app/chat/page.tsx or src/pages/chat.tsx
"use client";

import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatBox } from "@/components/custom/chatBox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function ChatSkeleton() {
  return (
    <div className="p-4">
      <Card className="p-2">
        <CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
        </CardTitle>
        <CardContent className="space-y-4 min-h-[400px]">
          {/* Alternating message skeletons to simulate real chat */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton
                  className={`h-16 rounded-lg ${index % 2 === 0 ? "w-48" : "w-40"}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
        <CardAction className="w-full">
          <div className="flex w-full gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardAction>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const { socket, isConnected } = useSocket(session);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status != "loading") {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (!socket) return;

    socket.on("recentMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("recentMessages");
      socket.off("newMessage");
    };
  }, [socket]);

  // const handleSendMessage = () => {
  //   if (!socket) return;
  //   const content = prompt("Enter message:");
  //   if (content) {
  //     socket.emit("sendMessage", { content });
  //   }
  // };
  const handleSendMessageAction = (formData: FormData) => {
    if (!socket) return;
    const content = formData.get("message") as string
    if (!content) {
      return
    }
    socket.emit("sendMessage", { content })
  }

  if (loading) {
    return <ChatSkeleton />
  } else if (status == "unauthenticated") {
    return <div>
      unauthenticated
    </div>
  }

  if (!session?.user?.name) {
    return <div>
      error: no username
    </div>
  }

  return (
    <div className="p-4">
      <Card className="p-2">
        <CardTitle>
          <div className="flex">
            <h1>Chat Room</h1> <div className={`w-3 h-3 ${isConnected ? "bg-green-600" : "bg-red-600"} rounded-full mt-1`}></div>
          </div>
        </CardTitle>
        <CardContent>
          <ChatBox messages={messages} username={session?.user?.name} />
        </CardContent>
        <CardAction className="w-full">
          <form action={handleSendMessageAction} className="flex w-full">
            <Input placeholder="message" className="w-full" name="message" />
            <Button>Send</Button>
          </form>
        </CardAction>
      </Card>
    </div>
  );
}