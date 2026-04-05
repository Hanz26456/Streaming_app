import { searchMovies, searchSeries, getPopularMovies, getPopularSeries, getPosterUrl } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'movie'

  let results = []

  if (query) {
    results = type === 'movie' ? await searchMovies(query) : await searchSeries(query)
  } else {
    results = type === 'movie' ? await getPopularMovies() : await getPopularSeries()
  }

  return NextResponse.json(results.slice(0, 20).map(item => ({
    tmdbId: item.id,
    title: item.title || item.name,
    description: item.overview,
    posterUrl: getPosterUrl(item.poster_path),
    releaseYear: (item.release_date || item.first_air_date || '').split('-')[0],
    rating: item.vote_average?.toFixed(1),
    type
  })))
}