import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const series = await prisma.series.findUnique({
      where: { id: parseInt(id) },
      include: {
        episodes: {
          orderBy: [{ season: 'asc' }, { episodeNumber: 'asc' }]
        }
      }
    })

    if (!series) {
      return NextResponse.json({ error: 'Series tidak ditemukan' }, { status: 404 })
    }

    // ✅ Fetch trailer dari TMDB
    let trailerKey = null
    if (series.tmdbId) {
      try {
        const trailerRes = await fetch(
          `https://api.themoviedb.org/3/tv/${series.tmdbId}/videos?language=en-US`,
          { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
        )
        const trailerData = await trailerRes.json()
        const trailer = trailerData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
        trailerKey = trailer?.key || null
      } catch (e) {
        console.log('Trailer series gagal:', e)
      }
    }

    return NextResponse.json({ ...series, trailerKey })

  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data series' }, { status: 500 })
  }
}