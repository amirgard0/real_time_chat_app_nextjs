import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import { redirect } from "next/navigation"


async function searchGroups(formData: FormData) {
  "use server"
  const name = formData.get("name")
  redirect(`/group/find/${name}`)
}

export default async function GroupSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-2">
            <Users className="h-10 w-10 text-blue-500" />
            Find Communities
          </h1>
          <p className="text-slate-600 max-w-md mx-auto">
            Discover and join communities that match your interests
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Groups
            </CardTitle>
            <CardDescription>
              Enter a group name or keyword to find relevant communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={searchGroups} className="flex gap-2">
              <Input
                name="name"
                placeholder="e.g. Developers, Artists, Gamers..."
                className="flex-1 py-5 text-lg"
                required
              />
              <Button type="submit" className="py-5 px-6">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}