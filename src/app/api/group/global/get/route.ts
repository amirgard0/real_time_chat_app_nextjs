import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { NextResponse } from "next/server"
export async function GET() {
  const session = await auth()
  let global = await prisma.group.findFirst({ where: { name: "global" } })
  if (!global) {
    global = await prisma.group.create({ data: { name: "global", creatorId: session?.user?.id as string } })
  }
  return NextResponse.json({ id: global.id })
}