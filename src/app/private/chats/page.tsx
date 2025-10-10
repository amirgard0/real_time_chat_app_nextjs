//src/app/private/chats/page.tsx

import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ChatShower } from "./chatShower"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const handleChatAction = async (formData: FormData) => {
  "use server"
  const chatId = formData.get("chatId") as string
  const lastSeen = formData.get("lastSeen") as string
  const targetUsername = formData.get("targetUsername") as string
  const targetUserId = formData.get("targetUserId") as string
  redirect(`/private/chats/?privateChatId=${chatId}&lastSeen=${lastSeen}&targetUsername=${targetUsername}&targetUserId=${targetUserId}`)
}

async function getHumanReadableTimeDistance(targetDate: Date | string | number) {
  "use server"
  const target = new Date(targetDate);
  const now = new Date();
  const diffInMs = target.getTime() - now.getTime();
  const absoluteDiff = Math.abs(diffInMs);

  const seconds = Math.floor(absoluteDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ${diffInMs > 0 ? 'from now' : 'ago'}`;
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ${diffInMs > 0 ? 'from now' : 'ago'}`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ${diffInMs > 0 ? 'from now' : 'ago'}`;
  if (days === 1) return diffInMs > 0 ? 'tomorrow' : 'yesterday';
  if (days < 7) return `${days} days ${diffInMs > 0 ? 'from now' : 'ago'}`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ${diffInMs > 0 ? 'from now' : 'ago'}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ${diffInMs > 0 ? 'from now' : 'ago'}`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ${diffInMs > 0 ? 'from now' : 'ago'}`;
}


export default async () => {
  const session = await auth()
  const chats = await prisma.privateChat.findMany({
    where: {
      OR: [
        {
          user1Id: session?.user?.id
        },
        {
          user2Id: session?.user?.id
        }
      ]
    },
    include: {
      user1: { select: { isOnline: true, publicId: true, name: true, lastSeen: true } }, user2: { select: { isOnline: true, publicId: true, name: true, lastSeen: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  })

  const chatCard = await Promise.all(
    chats.map(async (chat) => {
      const users = [{ userId: chat.user1Id, username: chat.user1.name, user: chat.user1 }, { userId: chat.user2Id, username: chat.user2.name, user: chat.user2 }]
      const other = users.filter((id) => id.userId != session?.user?.id)[0]
      if (!other) return
      const lastSeen = other.user.lastSeen ? await getHumanReadableTimeDistance(other.user.lastSeen) : "unknown"
      return { chat, lastSeen, other }
    })
  )

  if (chatCard.length <= 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No Chats Yet</h2>
          <p className="text-muted-foreground">
            Start a conversation by finding users and sending them a message.
          </p>
          <Button asChild className="mt-4">
            <Link href="/private/create">
              Find Users
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Chat List Sidebar */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <Card className="p-6 h-fit">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-bold text-foreground">Your Chats</h1>
            <p className="text-sm text-muted-foreground">
              {chatCard.length} conversation{chatCard.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-3">
            {chatCard.map((item) => {
              if (!item) return null;
              const lastMessage = item.chat.messages[0]
              return (
                <Card
                  key={item.chat.id}
                  className="p-4 hover:bg-accent/50 transition-all duration-200 border cursor-pointer group hover:shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {item.other.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                          item.other.user.isOnline ? "bg-green-500" : "bg-muted-foreground"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {item.other.username}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.other.user.isOnline ? "Online" : `Last seen ${item.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {lastMessage.createdAt.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  {lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mb-3">
                      {lastMessage.content}
                    </p>
                  )}

                  <form action={handleChatAction}>
                    <input type="hidden" value={item.chat.id} name="chatId" />
                    <input type="hidden" value={item.lastSeen} name="lastSeen" />
                    <input type="hidden" value={item.other.userId} name="targetUserId" />
                    <input type="hidden" value={item.other.user.name!} name="targetUsername" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full gap-2 group-hover:border-primary/50 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Open Chat
                    </Button>
                  </form>
                </Card>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-w-0">
        <Card className="h-full border rounded-lg shadow-sm">
          <ChatShower />
        </Card>
      </div>
    </div>
  )
}