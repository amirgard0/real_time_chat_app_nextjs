import { prisma } from "@/lib/prisma"
import SearchForm from "./SearchForm"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { handleChatAction } from "./actions"
import { Badge, Clock, MessageCircle } from "lucide-react"

export default async ({ searchParams }: { searchParams: any }) => {
  const awaitedSearchParams = await searchParams
  let users
  if (awaitedSearchParams.userId! && awaitedSearchParams.userId.length >= 5) {
    users = await prisma.user.findMany({
      where: { publicId: { contains: awaitedSearchParams.userId } }
    })
  }
  const session = await auth()
  return (
    <div className="min-h-screen bg-background">
      <SearchForm />
      {users && (
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{user.name}</span>
                    <Badge className="ml-2">
                      {user.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm font-mono opacity-70">
                    {user.publicId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last seen: {user.lastSeen?.toString() || "Unknown"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <form action={handleChatAction} className="w-full">
                    <input type="hidden" value={user.id} name="targetUserId" />
                    <input type="hidden" value={session?.user?.id} name="userId" />
                    <Button type="submit" className="w-full gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Start Chat
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}