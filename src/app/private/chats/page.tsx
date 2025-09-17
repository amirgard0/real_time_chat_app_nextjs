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
  redirect(`?privateChatId=${chatId}&lastSeen=${lastSeen}&targetUsername=${targetUsername}`)
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
  return <div className="flex gap-2">
    <div className="flex flex-col p-5 w-[20%] gap-2">
      {
        chats.map(async (chat) => {
          const users = [{ userId: chat.user1Id, username: chat.user1.name, user: chat.user1 }, { userId: chat.user2Id, username: chat.user2.name, user: chat.user2 }]
          const other = users.filter((id) => id.userId != session?.user?.id)[0]
          if (!other) return
          const lastSeen = other.user.lastSeen ? await getHumanReadableTimeDistance(other.user.lastSeen) : "unknown"
          return <Card key={chat.id} className="p-2 gap-2">
            <h6 className="text-sm m-0 p-0 font-semibold flex justify-between">{other.username} <p className="opacity-55">{other.user.isOnline ? "online" : "offline"}</p></h6>
            <div className="flex">
              <p className="px-2 opacity-70">
                {chat.messages[0].content.slice(0, 15)}
              </p>
              <small>{chat.messages[0].createdAt.getHours()}:{chat.messages[0].createdAt.getMinutes()}</small>
            </div>
            <form action={handleChatAction}>
              <input type="hidden" value={chat.id} name="chatId" />
              <input type="hidden" value={lastSeen} name="lastSeen" />
              <input type="hidden" value={other.user.name!} name="targetUsername" />
              <Button type="submit">Chat</Button>
            </form>
          </Card>
        })
      }
    </div>
    <div className="p-5 w-full">
      <ChatShower />
    </div>
  </div >
}