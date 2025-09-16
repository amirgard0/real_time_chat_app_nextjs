"use client"

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default () => {
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (userId.length < 3) {
      setError("should be more than three characters long")
      return
    }
    if (userId[0] != "@") {
      router.push("?userId=@" + userId)
    } else {
      router.push("?userId=" + userId)
    }
  }

  return <div className="max-w-4xl mx-auto p-2">
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-2">
        <Users className="h-10 w-10 text-blue-500" />
        Find Users
      </h1>
    </div>

    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {
          error && <Alert variant="destructive" className="flex mb-3">
            {error}
          </Alert>
        }
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="user id"
            className="flex-1 py-5 text-lg"
            value={userId}
            onChange={(e) => { setUserId(e.target.value) }}
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
} 