import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

function isAdmin(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return false
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.role === 'ADMIN'
  } catch { return false }
}

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [userCount, movieCount, seriesCount, episodeCount, reviewCount, premiumCount] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.series.count(),
      prisma.episode.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isPremium: true } })
    ])

    // Fetch most liked content (movies & series)
    // For simplicity, we'll get top 10 movies/series with most LIKES
    const movieLikes = await prisma.movie.findMany({
      take: 10,
      include: {
        _count: {
          select: { reviews: { where: { liked: true } } }
        }
      }
    })

    const seriesLikes = await prisma.series.findMany({
      take: 10,
      include: {
        _count: {
          select: { reviews: { where: { liked: true } } }
        }
      }
    })

    const mostLiked = [
      ...movieLikes.map(m => ({ id: m.id, title: m.title, type: 'movie', likes: m._count?.reviews || 0, _count: { reviews: m._count?.reviews || 0 } })),
      ...seriesLikes.map(s => ({ id: s.id, title: s.title, type: 'series', likes: s._count?.reviews || 0, _count: { reviews: s._count?.reviews || 0 } }))
    ].sort((a, b) => b.likes - a.likes).slice(0, 10)

    return NextResponse.json({
      users: userCount,
      premiumUsers: premiumCount,
      movies: movieCount,
      series: seriesCount,
      episodes: episodeCount,
      reviews: reviewCount,
      mostLiked
    })
  } catch (error) {
    console.error('ADMIN STATS ERROR:', error)
    return NextResponse.json({ error: 'Gagal mengambil data statistik' }, { status: 500 })
  }
}
