import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    return NextResponse.json({ user: { id: user.id, email, name } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }
}