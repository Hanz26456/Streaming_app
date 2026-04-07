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

export async function GET(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'continue' or null (all)

  try {
    const history = await prisma.watchHistory.findMany({
      where: {
        userId,
        ...(type === 'continue' ? {
          // Hanya ambil yang belum selesai (progress < 95% durasi)
          // Karena Prisma tidak bisa compare 2 kolom langsung di 'where', kita filter di JS atau asumsikan duration > 0
          progress: { gt: 0 }
        } : {})
      },
      include: {
        movie: true,
        series: true,
        episode: {
          include: {
            series: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: type === 'continue' ? 10 : 20
    })

    let filteredHistory = history
    if (type === 'continue') {
      // Filter di JS untuk akurasi progress < 95%
      filteredHistory = history.filter(h => h.progress < (h.duration * 0.95))
    }

    return NextResponse.json(filteredHistory)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil riwayat tontonan' }, { status: 500 })
  }
}

export async function POST(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { movieId, episodeId, seriesId, progress, duration } = await request.json()

    // Upsert logic
    let whereData = {}
    if (movieId) whereData = { userId_movieId: { userId, movieId } }
    else if (episodeId) whereData = { userId_episodeId: { userId, episodeId } }
    else return NextResponse.json({ error: 'ID konten tidak valid' }, { status: 400 })

    const data = {
      progress: parseFloat(progress),
      duration: parseFloat(duration),
      userId,
      movieId,
      episodeId,
      seriesId,
      updatedAt: new Date()
    }

    const history = await prisma.watchHistory.upsert({
      where: whereData,
      update: {
        progress: data.progress,
        duration: data.duration,
        updatedAt: data.updatedAt
      },
      create: data
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('WATCH HISTORY POST ERROR:', error)
    return NextResponse.json({ error: 'Gagal menyimpan riwayat tontonan' }, { status: 500 })
  }
}
