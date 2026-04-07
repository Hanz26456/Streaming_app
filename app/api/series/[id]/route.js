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

    // ✅ Cast fetch dari TMDB
    let cast = []
    if (series.tmdbId) {
      try {
        const castRes = await fetch(
          `https://api.themoviedb.org/3/tv/${series.tmdbId}/credits?language=id-ID`,
          { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
        )
        const castData = await castRes.json()
        cast = castData.cast?.slice(0, 12).map(c => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
        })) || []
      } catch (e) {
        console.log('Cast series gagal:', e)
      }
    }

    // ✅ Recommendations fetch dari TMDB
    let recommendations = []
    if (series.tmdbId) {
      try {
        const recRes = await fetch(
          `https://api.themoviedb.org/3/tv/${series.tmdbId}/recommendations?language=id-ID`,
          { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
        )
        const recData = await recRes.json()
        recommendations = (recData.results || []).slice(0, 10).map(r => ({
          id: r.id,
          title: r.name,
          posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
          backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : null,
          releaseYear: r.first_air_date?.[0] ? r.first_air_date.split('-')[0] : '',
          rating: r.vote_average?.toFixed(1),
          type: 'tv'
        }))
      } catch (e) {
        console.log('Recommendations series gagal:', e)
      }
    }

    return NextResponse.json({ ...series, trailerKey, cast, recommendations })

  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data series' }, { status: 500 })
  }
}