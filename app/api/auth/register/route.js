import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    })

    const token = signToken({ id: user.id, name: user.name, email: user.email })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (error) {
    console.error('REGISTER ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}