'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = isRegister
      ? await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: email.split('@')[0], email, password }) })
      : await signIn('credentials', { email, password, redirect: false })

    if (result?.ok) {
      router.push('/chat')
      router.refresh()
    } else {
      alert('Error: ' + (result?.status || 'Registration failed'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">{isRegister ? 'Register' : 'Login'}</h1>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 border" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 mb-2 border" required />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white">{isRegister ? 'Register' : 'Login'}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full p-2 text-blue-500">Switch to {isRegister ? 'Login' : 'Register'}</button>
    </form>
  )
}