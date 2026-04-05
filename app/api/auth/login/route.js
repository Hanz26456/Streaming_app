import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 404 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 })
    }

    // ✅ tambah role ke token
    const token = signToken({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      avatarUrl: user.avatarUrl,
      role: user.role  // ← tambah ini
    })

    return NextResponse.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        avatarUrl: user.avatarUrl,
        role: user.role  // ← tambah ini
      } 
    })

  } catch (error) {
    console.error('LOGIN ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}