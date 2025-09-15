"use client";

import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatBox } from "@/components/custom/chatBox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function ChatSkeleton() {
  return (
    <div className="p-4">
      <Card className="border-none shadow-lg">
        <CardTitle className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardTitle>

        <CardContent className="space-y-4 min-h-[400px] p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="max-w-xs">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton
                  className={`h-12 rounded-xl ${index % 2 === 0 ? "w-48" : "w-40"
                    }`}
                />
              </div>
            </div>
          ))}
        </CardContent>

        <CardAction className="p-4 pt-2">
          <div className="flex w-full gap-2">
            <Skeleton className="h-11 flex-1 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
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
  const [loading, setLoading] = useState(true);
  const groupId = "cmfl1kjjz0000tk7wi65go10w";
  const [joined, setJoined] = useState<{ joined: boolean; message: string }>({
    joined: false,
    message: "",
  });
  const sendForm = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!socket || !groupId) return;

    const handleJoin = () => {
      socket.emit("joinGroup", groupId, (response: any) => {
        console.log(response);
        if (response.status === "ok") setJoined({ joined: true, message: "good" });
        else if (response.status === "not found")
          setJoined({ joined: false, message: "not found" });
        else alert("Error joining group");
      });
    };

    handleJoin();

    return () => {
      socket.emit("leaveGroup", groupId); // ✅ Clean up
    };
  }, [socket, groupId]);

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("globalMessages");

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

  const handleSendMessageAction = (formData: FormData, socket: any) => {
    if (!socket) return;
    const content = formData.get("message") as string;
    if (!content.trim()) return;

    socket.emit("sendMessage", { content, groupId });
    sendForm.current?.reset()
  };

  if (loading || !joined.joined) {
    return <ChatSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-gray-700">You must be signed in to chat.</h2>
        <Button variant="outline" className="mt-4" onClick={() => window.location.assign("/api/auth/signin")}>
          Sign In
        </Button>
      </div>
    );
  }

  if (!session?.user?.name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-gray-700">Your profile is incomplete.</h2>
        <p className="text-gray-500 mt-2">Please ensure your name is set in your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <Card className="flex-1 border-none shadow-lg rounded-2xl flex flex-col">
        <CardTitle className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">💬 Chat Room</h1>
            <div className="relative">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                title={isConnected ? "Online" : "Offline"}
              ></div>
              {!isConnected && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              )}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{groupId.slice(-6)}</span>
        </CardTitle>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ChatBox messages={messages} username={session.user.name} />
        </CardContent>

        <CardAction className="p-4 border-t border-border w-full">
          <form
            action={(formData: FormData) =>
              handleSendMessageAction(formData, socket)
            }
            className="flex w-full gap-2"
            ref={sendForm}
          >
            <Input
              name="message"
              placeholder="Type a message..."
              className="flex-1 rounded-full px-4 py-3 h-12 focus:ring-2 text-3xl focus:ring-blue-500 focus:outline-none"
              aria-label="Type your message"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full w-9 h-9 bg-blue-600 hover:bg-blue-700 right-13 my-auto relative"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
          </form>
        </CardAction>
      </Card>
    </div>
  );
}