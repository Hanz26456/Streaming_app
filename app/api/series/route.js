import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET semua series dengan filter & sortir
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre')
  const year = searchParams.get('year')
  const sort = searchParams.get('sort') // 'newest' | 'oldest' | 'title' | 'popular'

  let orderBy = { createdAt: 'desc' }
  if (sort === 'oldest') orderBy = { releaseYear: 'asc' }
  if (sort === 'newest') orderBy = { releaseYear: 'desc' }
  if (sort === 'title') orderBy = { title: 'asc' }
  if (sort === 'popular') orderBy = { watchHistory: { _count: 'desc' } }

  try {
    const series = await prisma.series.findMany({
      where: {
        ...(genre && genre !== 'Semua' ? { genre: { contains: genre } } : {}),
        ...(year ? { releaseYear: parseInt(year) } : {})
      },
      orderBy,
      include: {
        _count: { select: { episodes: true } }
      }
    })

    return NextResponse.json(series)
  } catch (error) {
    console.log('ERROR SERIES:', error)
    return NextResponse.json({ error: 'Gagal mengambil data series' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, genre, releaseYear, posterUrl, totalSeasons } = body

    if (!title) {
      return NextResponse.json({ error: 'Title wajib diisi' }, { status: 400 })
    }

    const series = await prisma.series.create({
      data: { title, description, genre, releaseYear, posterUrl, totalSeasons }
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.log('ERROR POST SERIES:', error)
    return NextResponse.json({ error: 'Gagal menambahkan series' }, { status: 500 })
  }
}