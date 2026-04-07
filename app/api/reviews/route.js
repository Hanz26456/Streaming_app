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
  const { searchParams } = new URL(request.url)
  const movieId = searchParams.get('movieId') ? parseInt(searchParams.get('movieId')) : null
  const seriesId = parseInt(searchParams.get('seriesId')) || null

  if (!movieId && !seriesId) return NextResponse.json({ error: 'ID konten tidak valid' }, { status: 400 })

  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { movieId: movieId || undefined },
          { seriesId: seriesId || undefined }
        ]
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const likes = reviews.filter(r => r.liked).length
    const dislikes = reviews.length - likes

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        likes,
        dislikes,
        ratingPercent: reviews.length > 0 ? Math.round((likes / reviews.length) * 100) : 0
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil ulasan' }, { status: 500 })
  }
}

export async function POST(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { movieId, seriesId, liked, comment } = await request.json()

    const existing = await prisma.review.findFirst({
      where: movieId 
        ? { userId, movieId: parseInt(movieId) }
        : { userId, seriesId: parseInt(seriesId) }
    })

    let review
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { liked, comment, updatedAt: new Date() }
      })
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          movieId: movieId ? parseInt(movieId) : null,
          seriesId: seriesId ? parseInt(seriesId) : null,
          liked,
          comment
        }
      })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('REVIEW POST ERROR:', error)
    return NextResponse.json({ error: 'Gagal mengirim ulasan' }, { status: 500 })
  }
}
