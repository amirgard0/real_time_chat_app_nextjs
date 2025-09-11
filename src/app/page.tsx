//src/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
// import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await auth()
  redirect(session ? '/chat' : '/login')
}