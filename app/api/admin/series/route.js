import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const series = await prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, posterUrl: true,
      releaseYear: true, genre: true,
      isPremium: true,
      _count: { select: { episodes: true } }
    }
  })
  return NextResponse.json(series)
}