"use client"

import { ChatBox } from "@/components/custom/chatBox";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/useSocket";
import { Link } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DefaultEventsMap } from "socket.io";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

function ChatSkeleton() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card className="p-4 shadow-lg">
        <CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="w-3 h-3 rounded-full animate-pulse" />
          </div>
        </CardTitle>
        <CardContent className="space-y-4 min-h-[400px]">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-20 animate-pulse" />
                  <Skeleton className="h-3 w-16 animate-pulse" />
                </div>
                <Skeleton
                  className={`h-16 rounded-lg animate-pulse ${index % 2 === 0 ? "w-48" : "w-40"}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
        <CardAction className="w-full">
          <div className="flex w-full gap-2">
            <Skeleton className="h-10 flex-1 animate-pulse" />
            <Skeleton className="h-10 w-20 animate-pulse" />
          </div>
        </CardAction>
      </Card>
    </div>
  );
}

function ChatNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">chat Not Found</h1>
      <p className="text-muted-foreground mt-2">The chat you're trying to access doesn't exist.</p>
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Return to Home
      </Link>
    </div>
  );
}

type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap>;

export const PrivateChat = ({
  session,
  status,
  socket,
  isConnected
}: {
  session: Session | null,
  status: "authenticated" | "loading" | "unauthenticated",
  socket: AppSocket | null,
  isConnected: boolean
}) => {

  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true)
  const { privateChatId } = useParams<{ privateChatId: string }>();
  const [joined, setJoined] = useState<{ joined: boolean; message: string }>({
    joined: false,
    message: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessageAction = async (formData: FormData) => {
    if (!socket || !inputRef.current) return;
    const content = formData.get("message") as string;
    if (!content.trim()) {
      return;
    }
    setSending(true);
    socket.emit("sendPrivateMessage", { content, privateChatId }, (response: any) => {
      setSending(false);
      inputRef.current!.value = "";
      if (response?.status === "error") {
        toast.error("Failed to send message");
      }
    });
  };

  useEffect(() => {
    if (!socket || !privateChatId) return;

    const handleJoin = () => {
      socket.emit("joinPrivateChat", privateChatId, (response: any) => {
        if (response.status === "ok") {
          setJoined({ joined: true, message: "good" });
          console.log(response)
          setMessages(response.messages)
        } else if (response.status === "not found") {
          setJoined({ joined: false, message: "not found" });
        } else {
          toast.error("Failed to join");
        }
      });
    };

    handleJoin();

    return () => {
      socket.emit("leaveGroup", privateChatId);
    };
  }, [socket, privateChatId]);


  useEffect(() => {
    if (!socket) return;

    // Add the event listener
    socket.on("newPrivateMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup: remove the specific listener
    return () => {
      socket.off("newPrivateMessage");
    };
  }, [socket]);

  useEffect(() => {
    if (status != "loading") {
      setLoading(false)
    }
  }, [status])

  if (loading) {
    return <ChatSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Please sign in to access the chat.</p>
      </div>
    );
  }

  if (!session?.user?.name) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Error: Username not found.</p>
      </div>
    );
  }

  if (joined.message === "not found") {
    return <ChatNotFound />;
  }


  return <div>
    <Card className="p-4 shadow-lg">
      <CardTitle>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <div
            className={`w-3 h-3 ${isConnected ? "bg-green-600" : "bg-red-600"} rounded-full`}
            title={isConnected ? "Connected" : "Disconnected"}
          ></div>
        </div>
      </CardTitle>
      <CardContent className="min-h-[400px]">
        <ChatBox messages={messages} username={session?.user?.name} />
      </CardContent>
      <CardAction className="w-full">
        <form
          action={handleSendMessageAction}
          className="flex w-full gap-2"
        >
          <Input
            placeholder="Type a message..."
            className="w-full"
            name="message"
            ref={inputRef}
            aria-label="Message input"
            disabled={sending}
          />
          <Button disabled={sending} aria-label="Send message">
            {sending ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardAction>
    </Card>
  </div>
}