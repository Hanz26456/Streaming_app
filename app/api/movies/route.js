import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET semua film
export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' }
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