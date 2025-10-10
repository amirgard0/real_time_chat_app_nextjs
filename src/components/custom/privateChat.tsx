//src/components/custom/privateChat.tsx

"use client"

import { ChatBox } from "@/components/custom/chatBox";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "lucide-react";
import { Session } from "next-auth";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DefaultEventsMap } from "socket.io";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

function ChatSkeleton() {
  return (
    <div className="p-2 sm:p-4 max-w-3xl mx-auto w-full">
      <Card className="p-2 sm:p-4 shadow-lg">
        <CardTitle className="px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="w-3 h-3 rounded-full animate-pulse" />
          </div>
        </CardTitle>
        <CardContent className="space-y-4 min-h-[300px] sm:min-h-[400px] p-2 sm:p-4">
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
        <CardAction className="w-full p-2 sm:p-4">
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
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <h1 className="text-xl sm:text-2xl font-bold">Chat Not Found</h1>
      <p className="text-muted-foreground mt-2 text-sm sm:text-base">
        The chat you're trying to access doesn't exist.
      </p>
      <Link href="/" className="mt-4 text-primary hover:underline text-sm sm:text-base">
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
  privateChatId: CprivateChatId
}: {
  session: Session | null,
  status: "authenticated" | "loading" | "unauthenticated",
  socket: AppSocket | null,
  isConnected: boolean,
  privateChatId?: null | string
}) => {

  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesRef = useRef<any[]>([])

  // const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  let privateChatId
  if (!CprivateChatId) {
    const { privateChatId: PId } = useParams<{ privateChatId: string }>();
    privateChatId = PId
  } else (
    privateChatId = CprivateChatId
  )
  const lastSeen = searchParams.get("lastSeen")
  const targetUsername = searchParams.get("targetUsername")
  const targetUserId = searchParams.get("targetUserId")
  if (!privateChatId) {
    toast.error("no private chat Id")
  }

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
    socket.emit("sendPrivateMessage", { content, isRead: isOnline, privateChatId }, (response: any) => {
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
          messagesRef.current = response.messages
          setMessages(response.messages)
        } else if (response.status === "not found") {
          setJoined({ joined: false, message: "not found" });
        } else {
          toast.error("Failed to join");
        }
      });
    };
    if (targetUserId) {
      socket.emit("joinOnlineStatus", targetUserId, (isOnline: boolean | undefined) => {
        if (typeof isOnline == "boolean") {
          setIsOnline(isOnline)
        }
      })
    } else {
      toast.warning("please use the chat buttons to load the chat instead of urls.")
    }
    socket.emit("chatOnline", true)

    handleJoin();

    return () => {
      socket.emit("leaveGroup", "privateChat" + privateChatId);
      socket.emit("leaveOnlineStatus", targetUserId)
      socket.emit("chatOnline", false)
    };
  }, [socket, privateChatId]);


  useEffect(() => {
    if (!socket) return;
    // Add the event listener
    socket.on("newPrivateMessage", (msg: any) => {
      messagesRef.current.push(msg)
      setMessages([...messagesRef.current]);
    });

    socket.on("seen", () => {
      messagesRef.current = messagesRef.current.map((msg) => {
        msg.isRead = true
        return msg
      })
      setMessages([...messagesRef.current]);
    })

    socket.on("onlineStatus", (isOnline: boolean) => {
      setIsOnline(isOnline)
    })
    // Cleanup: remove the specific listener
    return () => {
      socket.off("newPrivateMessage");
      socket.off("onlineStatus")
      socket.off("seen")
    };
  }, [socket]);

  const loading = status === "loading"


  if (loading) {
    return <ChatSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <p className="text-base sm:text-lg">Please sign in to access the chat.</p>
      </div>
    );
  }

  if (!session?.user?.name) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <p className="text-base sm:text-lg">Error: Username not found.</p>
      </div>
    );
  }

  if (joined.message === "not found") {
    return <ChatNotFound />;
  }


  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-background border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isOnline ? "bg-green-500" : "bg-muted-foreground"
              )} />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {targetUsername}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? (
                    <span className="text-green-600 font-medium">Online</span>
                  ) : (
                    <span>Last seen: {lastSeen}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="p-0">
          <div className="h-[500px] bg-muted/20">
            <ChatBox messages={messages} username={session?.user?.name} />
          </div>
        </CardContent>

        {/* Message Input */}
        <CardFooter className="p-6 border-t">
          <form
            action={handleSendMessageAction}
            className="flex w-full gap-3"
          >
            <Input
              placeholder="Type your message..."
              className="flex-1 bg-background"
              name="message"
              ref={inputRef}
              disabled={sending}
            />
            <Button
              disabled={sending}
              className="gap-2"
              size="lg"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send
                </>
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}