import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card"
import { Prisma } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

type GroupWithCreatorName = Prisma.GroupGetPayload<{
  include: { creator: { select: { name: true } } }
}>

const handleJoin = async (groupId: string) => {
  "use server"
  let path
  try {
    const session = await auth()
    if (!session?.user) {
      // redirect("/login")
      path = "/login"
      return
    }
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id as string,
        groupId: groupId
      }
    })

    if (!existingMember) {
      await prisma.groupMember.create({
        data: {
          userId: session.user.id as string,
          groupId: groupId
        }
      })
    }

    // redirect(`/chat/${groupId}`)
    path = `/chat/${groupId}`
  } catch (error) {
    console.error("error: " + error)
  }
  if (path) {
    redirect(path)
  }
}

export default async ({ params }: { params: any }) => {
  const awaitedParams = await params
  const name = awaitedParams.name

  const groups = await prisma.group.findMany({
    where: {
      name: { contains: name }
    },
    include: { creator: { select: { name: true } } }
  })

  const getMembersCount = async (groupId: string) => {
    return await prisma.groupMember.count(
      {
        where: {
          groupId: groupId
        }
      }
    )
  }

  return <div className="p-4">
    <div className="grid grid-cols-5 gap-5">
      {
        groups.map(async (group: GroupWithCreatorName) => {
          return <Card key={group.id} className="py-3">
            <CardTitle className="flex justify-center">
              <h2>{group.name}</h2>
            </CardTitle>
            <CardContent>
              creator: <small>{group.creator.name}</small>
              <br />
              members: <small>{await getMembersCount(group.id)}</small>
            </CardContent>
            <CardAction className="px-2 w-full">
              <form action={async () => { "use server"; await handleJoin(group.id) }}>
                <Button className="w-full">
                  Join
                </Button>
              </form>
            </CardAction>
          </Card>
        })
      }
    </div>
  </div>
}