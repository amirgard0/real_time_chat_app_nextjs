"use server"
import { prisma } from "@/lib/prisma";
import { redirect, RedirectType } from "next/navigation";

async function findOrCreatePrivateChat(user1Id: string, user2Id: string) {
  const sortedIds = [user1Id, user2Id].sort();

  return await prisma.privateChat.upsert({
    where: {
      user1Id_user2Id: {
        user1Id: sortedIds[0],
        user2Id: sortedIds[1]
      }
    },
    create: {
      user1Id: sortedIds[0],
      user2Id: sortedIds[1]
    },
    update: {}
  });
}

export async function handleChatAction(formData: FormData) {
  const targetUserId = formData.get("targetUserId") as string
  const userId = formData.get("userId") as string
  if (!targetUserId || !userId) {
    return
  }
  let chat
  try {
    chat = await findOrCreatePrivateChat(targetUserId, userId)
  } catch (error) {
    console.error()
  }
  if (chat) {
    redirect("/private/chats?privateChatId=" + chat.id, RedirectType.replace)
  }
}