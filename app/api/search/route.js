import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const genre = searchParams.get('genre') || ''
    const type = searchParams.get('type') || 'all' // 'all' | 'movie' | 'series'

    const whereMovie = {
      AND: [
        query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ]
        } : {},
        genre ? { genre: { contains: genre } } : {},
      ]
    }

    const whereSeries = {
      AND: [
        query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ]
        } : {},
        genre ? { genre: { contains: genre } } : {},
      ]
    }

    let movies = []
    let series = []

    if (type === 'all' || type === 'movie') {
      movies = await prisma.movie.findMany({
        where: whereMovie,
        orderBy: { title: 'asc' }
      })
    }

    if (type === 'all' || type === 'series') {
      series = await prisma.series.findMany({
        where: whereSeries,
        orderBy: { title: 'asc' },
        include: { _count: { select: { episodes: true } } }
      })
    }

    return NextResponse.json({ movies, series, total: movies.length + series.length })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan pencarian' }, { status: 500 })
  }
}