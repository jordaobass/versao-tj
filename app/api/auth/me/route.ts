import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

interface SessionData {
  userId: string
  email: string
  timestamp: number
}

interface User {
  id: string
  email: string
  password: string
  name: string
}

interface UsersData {
  users: User[]
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Decodificar token
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    // Buscar nome do usuário
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const usersFile = fs.readFileSync(usersPath, 'utf-8')
    const usersData: UsersData = JSON.parse(usersFile)
    const user = usersData.users.find((u) => u.id === sessionData.userId)

    return NextResponse.json({
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: user?.name,
      },
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
