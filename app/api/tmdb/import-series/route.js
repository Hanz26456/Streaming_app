import { prisma } from '@/lib/prisma'
import { getSeriesDetail, getSeriesEpisodes, getPosterUrl } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { tmdbId } = await req.json()

    const data = await getSeriesDetail(tmdbId)
    if (!data || data.status_message) {
      return NextResponse.json({ error: 'Series tidak ditemukan di TMDB' }, { status: 404 })
    }

    const genres = data.genres?.map(g => g.name).join(', ') || 'Unknown'
    const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null
    const posterUrl = getPosterUrl(data.poster_path)
    const releaseYear = parseInt(data.first_air_date?.split('-')[0]) || 0
    const totalSeasons = data.number_of_seasons || 1

    // Cek apakah sudah ada
    const existing = await prisma.series.findFirst({
      where: { tmdbId }
    })

    let series
    if (existing) {
      series = await prisma.series.update({
        where: { id: existing.id },
        data: { title: data.name, description: data.overview, genre: genres, releaseYear, posterUrl, backdropUrl, totalSeasons }
      })
    } else {
      series = await prisma.series.create({
        data: { tmdbId, title: data.name, description: data.overview, genre: genres, releaseYear, posterUrl, backdropUrl, totalSeasons }
      })
    }

    // Import semua episode dari setiap season
    let totalEpisodes = 0
    for (let s = 1; s <= totalSeasons; s++) {
      const seasonData = await getSeriesEpisodes(tmdbId, s)
      if (!seasonData?.episodes) continue

      for (const ep of seasonData.episodes) {
        const thumbnailUrl = ep.still_path ? `https://image.tmdb.org/t/p/w400${ep.still_path}` : null

        await prisma.episode.upsert({
          where: {
            seriesId_season_episodeNumber: {
              seriesId: series.id,
              season: s,
              episodeNumber: ep.episode_number
            }
          },
          update: {
            title: ep.name || `Episode ${ep.episode_number}`,
            description: ep.overview || '',
            duration: ep.runtime || 0,
            thumbnailUrl,
            videoUrl: ''
          },
          create: {
            seriesId: series.id,
            title: ep.name || `Episode ${ep.episode_number}`,
            description: ep.overview || '',
            season: s,
            episodeNumber: ep.episode_number,
            duration: ep.runtime || 0,
            thumbnailUrl,
            videoUrl: ''
          }
        })
        totalEpisodes++
      }
    }

    return NextResponse.json({ success: true, series, totalEpisodes })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}