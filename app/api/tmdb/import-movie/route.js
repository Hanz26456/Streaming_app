import { prisma } from '@/lib/prisma'
import { getMovieDetail, getPosterUrl } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { tmdbId } = await req.json()

    const movie = await getMovieDetail(tmdbId)
    if (!movie || movie.status_message) {
      return NextResponse.json({ error: 'Film tidak ditemukan di TMDB' }, { status: 404 })
    }

    const genres = movie.genres?.map(g => g.name).join(', ') || 'Unknown'
    const releaseYear = parseInt(movie.release_date?.split('-')[0]) || 0
    const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null

    const existing = await prisma.movie.findFirst({
      where: { tmdbId }
    })

    let saved
    if (existing) {
      saved = await prisma.movie.update({
        where: { id: existing.id },
        data: {
          title: movie.title,
          description: movie.overview || '',
          genre: genres,
          releaseYear,
          duration: movie.runtime || 0,
          posterUrl: getPosterUrl(movie.poster_path),
          backdropUrl,
          videoUrl: existing.videoUrl || ''
        }
      })
    } else {
      saved = await prisma.movie.create({
        data: {
          tmdbId,
          title: movie.title,
          description: movie.overview || '',
          genre: genres,
          releaseYear,
          duration: movie.runtime || 0,
          posterUrl: getPosterUrl(movie.poster_path),
          backdropUrl,
          videoUrl: ''
        }
      })
    }

    return NextResponse.json({ success: true, movie: saved })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}