import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET semua film dengan filter & sortir
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
    const movies = await prisma.movie.findMany({
      where: {
        ...(genre && genre !== 'Semua' ? { genre: { contains: genre } } : {}),
        ...(year ? { releaseYear: parseInt(year) } : {})
      },
      orderBy
    })
    return NextResponse.json(movies)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data film' },
      { status: 500 }
    )
  }
}

// POST tambah film baru (untuk admin nanti)
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, genre, releaseYear, duration, videoUrl, posterUrl } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Title dan videoUrl wajib diisi' },
        { status: 400 }
      )
    }

    const movie = await prisma.movie.create({
      data: { title, description, genre, releaseYear, duration, videoUrl, posterUrl }
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambahkan film' },
      { status: 500 }
    )
  }
}