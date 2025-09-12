import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"


async function somethingAction(formData: FormData) {
  "use server"
  const name = formData.get("name")
  redirect(`/group/find/${name}`)
}

export default async function Page() {

  return (
    <div className="flex justify-center pt-5">
      <Card className="p-3">
        <CardTitle>
          <h1 className="ml-5">find groups</h1>
        </CardTitle>
        <CardContent>
          <form action={somethingAction}>
            <Input name="name" placeholder="name" />
            <Button type="submit" className="w-full">submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
