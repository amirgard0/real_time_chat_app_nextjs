"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// Server action
async function createGroup(formData: FormData) {
  "use server"

  try {
    const session = await auth()
    const name = formData.get("name") as string

    // Validate authentication
    if (!session?.user) {
      throw new Error("You must be logged in to create a group")
    }

    // Validate input
    if (!name || name.trim().length === 0) {
      throw new Error("Group name is required")
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        creatorId: session.user.id as string,
      }
    })

    // Also add the creator as a member of the group
    await prisma.groupMember.create({
      data: {
        userId: session.user.id as string,
        groupId: group.id,
      }
    })

    redirect(`/chat/${group.id}`)

  } catch (error) {
    console.error("Error creating group:", error)
    // You might want to handle this error more gracefully
    // For example, return an error message to the form
    throw error
  }
}

export default async function CreateGroupPage() {
  const session = await auth()

  // Optional: Redirect if not authenticated
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex justify-center py-4">
      <Card className="w-[50%] p-2">
        <CardTitle>
          <h1 className="text-2xl font-bold ml-5">Create New Group</h1>
        </CardTitle>
        <CardContent>
          <form action={createGroup} className="space-y-4">
            <Input
              placeholder="Enter group name"
              name="name"
              required
              minLength={1}
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Create Group
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}