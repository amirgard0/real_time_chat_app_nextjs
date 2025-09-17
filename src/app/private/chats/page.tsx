import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ChatShower } from "./chatShower"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

const handleChatAction = async (formData: FormData) => {
  "use server"
  const chatId = formData.get("chatId") as string
  redirect("?privateChatId=" + chatId)
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
      user1: { select: { isOnline: true, publicId: true, name: true } }, user2: { select: { isOnline: true, publicId: true, name: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  })

  return <div className="flex gap-2">
    <div className="flex flex-col p-5 w-[20%] gap-2">
      {
        chats.map((chat) => {
          const users = [{ userId: chat.user1Id, username: chat.user1.name }, { userId: chat.user2Id, username: chat.user2.name }]
          const other = users.filter((id) => id.userId != session?.user?.id)[0]
          if (!other) return
          return <Card key={chat.id} className="p-2 gap-2">
            <h6 className="text-sm m-0 p-0 font-semibold">{other.username}</h6>
            <div className="flex">
              <p className="px-2 opacity-70">
                {chat.messages[0].content.slice(0, 15)}
              </p>
              <small>{chat.messages[0].createdAt.getHours()}:{chat.messages[0].createdAt.getMinutes()}</small>
            </div>
            <form action={handleChatAction}>
              <input type="hidden" value={chat.id} name="chatId" />
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