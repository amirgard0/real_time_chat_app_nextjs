import { prisma } from "@/lib/prisma"
import SearchForm from "./SearchForm"
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { handleChatAction } from "./actions"

export default async ({ searchParams }: { searchParams: any }) => {
  const awaitedSearchParams = await searchParams
  let users
  if (awaitedSearchParams.userId! && awaitedSearchParams.userId.length >= 5) {
    users = await prisma.user.findMany({
      where: { publicId: { contains: awaitedSearchParams.userId } }
    })
  }
  const session = await auth()
  return <div>
    <SearchForm />
    {
      users && <div className="grid grid-cols-5 p-7">
        {users.map((user) => {
          return <Card key={user.id}>
            <CardTitle className="px-3">
              <h1>
                {user.name} <small className="opacity-70">{user.publicId}</small>
              </h1>
            </CardTitle>
            <CardContent>
              <small>
                lastSeen: {user.lastSeen?.toString() || "unknown"}
              </small>
              <br />
              <small>
                {user.isOnline ? "online" : "offline"}
              </small>
            </CardContent>
            <CardAction className="w-full px-3 py-0">
              <form action={handleChatAction}>
                <input type="hidden" value={user.id} name="targetUserId" />
                <input type="hidden" value={session?.user?.id} name="userId" />
                <Button className="w-full" type="submit">
                  chat
                </Button>
              </form>
            </CardAction>
          </Card>
        })}
      </div>
    }
  </div>
}