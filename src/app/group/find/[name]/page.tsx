import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Hash, Shield, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

type GroupWithCreatorName = Prisma.GroupGetPayload<{
  include: { creator: { select: { name: true } } }
}>


const handleJoin = async (groupId: string) => {
  "use server"
  try {
    const session = await auth()
    if (!session?.user) {
      redirect("/login")
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

  } catch (error) {
    console.error("Error joining group: ", error)
    redirect("/error")
  }
  redirect(`/chat/${groupId}`)
}

export default async function GroupResultsPage({ params }: { params: { name: string } }) {
  const awaitedParams = await params
  const name = awaitedParams.name

  const [groups, session] = await Promise.all([
    prisma.group.findMany({
      where: {
        name: { contains: name }
      },
      include: {
        creator: { select: { name: true } },
        _count: {
          select: { members: true }
        }
      }
    }),
    auth()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Search Results for "{name}"
          </h1>
          <p className="text-slate-600">
            Found {groups.length} group{groups.length !== 1 ? 's' : ''} matching your search
          </p>
        </div>

        {groups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-700 mb-2">No groups found</h3>
              <p className="text-slate-500">
                Try searching with different keywords or browse all groups
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <Card key={group.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      {group.name}
                    </CardTitle>
                    {group.isPrivate && (
                      <>
                        <div>
                          Private group
                        </div>
                        <Shield className="h-5 w-5 text-slate-400" />
                      </>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Created by {group.creator.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-slate-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{group._count.members} member{group._count.members !== 1 ? 's' : ''}</span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <form action={async () => { "use server"; await handleJoin(group.id) }} className="w-full">
                    <Button
                      className="w-full"
                      disabled={!session?.user}
                    >
                      {session?.user ? (
                        <>
                          Join Group <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Sign in to Join"
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}