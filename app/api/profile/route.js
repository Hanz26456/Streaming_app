import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function getUserId(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.id
  } catch { return null }
}

// GET — ambil data profil + statistik
export async function GET(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            watchlist: true,
            watchHistory: true,
          }
        }
      }
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 })
  }
}

// PATCH — update nama, password, atau avatarUrl
export async function PATCH(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, currentPassword, newPassword, avatarUrl } = await request.json()
    const updateData = {}

    if (name) updateData.name = name
    if (avatarUrl) updateData.avatarUrl = avatarUrl

    // Kalau mau ganti password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Password lama wajib diisi' }, { status: 400 })
      }
      const user = await prisma.user.findUnique({ where: { id: userId } })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, avatarUrl: true }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update profil' }, { status: 500 })
  }
}