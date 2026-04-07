import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, posterUrl: true,
      videoUrl: true, releaseYear: true, genre: true,
      isPremium: true
    }
  })
  return NextResponse.json(movies)
}