//src/app/private/chats/page.tsx

import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ChatShower } from "./chatShower"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

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
    return <div className="p-7">
      not any chats yet
    </div>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4 md:p-6">
      <div className="w-full lg:w-[300px] xl:w-[350px] flex-shrink-0">
        <div className="flex flex-col gap-2">
          {chatCard.length <= 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No chats yet
            </div>
          ) : (
            chatCard.map((item) => {
              if (!item) return null;
              const lastMessage = item.chat.messages[0]
              return (
                <Card key={item.chat.id} className="p-3 gap-2 hover:bg-accent transition-colors">
                  <h6 className="text-sm font-semibold flex justify-between items-center">
                    <span className="truncate">{item.other.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {lastMessage && `${lastMessage.createdAt.getHours()}:${lastMessage.createdAt.getMinutes().toString().padStart(2, '0')}`}
                    </span>
                  </h6>
                  {lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMessage.content.slice(0, 30)}
                      {lastMessage.content.length > 30 && '...'}
                    </p>
                  )}
                  <form action={handleChatAction} className="mt-2">
                    <input type="hidden" value={item.chat.id} name="chatId" />
                    <input type="hidden" value={item.lastSeen} name="lastSeen" />
                    <input type="hidden" value={item.other.userId} name="targetUserId" />
                    <input type="hidden" value={item.other.user.name!} name="targetUsername" />
                    <Button type="submit" size="sm" className="w-full">
                      Open Chat
                    </Button>
                  </form>
                </Card>
              )
            })
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-background rounded-lg border">
          <ChatShower />
        </div>
      </div>
    </div>
  )
}