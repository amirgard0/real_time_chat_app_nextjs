//src/app/private/create

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Find Users</h1>
        <p className="text-muted-foreground mt-2">
          Search for users by their public ID to start a private conversation
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
          <CardDescription>
            Enter a user's public ID to find and connect with them
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <div className="flex-1 relative">
              <Input
                name="name"
                placeholder="@username"
                className="py-6 text-lg pl-10"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                  setError("")
                }}
                required
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" size="lg" className="py-6 px-8 gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 