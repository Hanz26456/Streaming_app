import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

function getUserId(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.id
  } catch { return null }
}

export async function POST(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
      select: { id: true, name: true, isPremium: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Selamat! Akun Anda kini sudah Premium.',
      user: updatedUser
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses langganan' }, { status: 500 })
  }
}
