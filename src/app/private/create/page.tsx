"use server"

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function findOrCreatePrivateChat(user1Id: string, user2Id: string) {
  "use server"
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

function handleFormAction(formData: FormData) {

}

export default async () => {
  const session = await auth()

  if (!session) {
    return <div>
      not authenticated
    </div>
  }

  return <div>
    create
  </div>
}