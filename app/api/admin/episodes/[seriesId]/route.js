import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET semua episode dari series
export async function GET(request, { params }) {
  const { seriesId } = await params
  const episodes = await prisma.episode.findMany({
    where: { seriesId: parseInt(seriesId) },
    orderBy: [{ season: 'asc' }, { episodeNumber: 'asc' }]
  })
  return NextResponse.json(episodes)
}

// PATCH update videoUrl episode
export async function PATCH(request, { params }) {
  const { seriesId } = await params
  const { episodeId, videoUrl } = await request.json()
  const episode = await prisma.episode.update({
    where: { id: parseInt(episodeId) },
    data: { videoUrl }
  })
  return NextResponse.json(episode)
}