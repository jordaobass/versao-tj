import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

interface User {
  id: string
  email: string
  password: string
  name: string
}

interface UsersData {
  users: User[]
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Ler arquivo de usuários
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const usersFile = fs.readFileSync(usersPath, 'utf-8')
    const usersData: UsersData = JSON.parse(usersFile)

    // Buscar usuário
    const user = usersData.users.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Criar sessão simples (token = base64 do id + timestamp)
    const sessionToken = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email, timestamp: Date.now() })
    ).toString('base64')

    // Definir cookie de sessão
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
