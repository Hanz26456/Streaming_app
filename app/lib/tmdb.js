const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

export async function searchMovies(query) {
  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`)
  const data = await res.json()
  return data.results || []
}

export async function searchSeries(query) {
  const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`)
  const data = await res.json()
  return data.results || []
}

export async function getPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&region=ID`)
  const data = await res.json()
  return data.results || []
}

export async function getPopularSeries() {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=id-ID`)
  const data = await res.json()
  return data.results || []
}

export async function getMovieDetail(tmdbId) {
  const res = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}&language=id-ID`)
  return res.json()
}

export async function getSeriesDetail(tmdbId) {
  const res = await fetch(`${BASE_URL}/tv/${tmdbId}?api_key=${API_KEY}&language=id-ID&append_to_response=seasons`)
  return res.json()
}

export async function getSeriesEpisodes(tmdbId, season) {
  const res = await fetch(`${BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${API_KEY}&language=id-ID`)
  return res.json()
}

export function getPosterUrl(path) {
  return path ? `${IMG_BASE}${path}` : 'https://picsum.photos/300/450'
}
export async function getSeriesBackdrop(tmdbId) {
  if (!tmdbId) return null
  const res = await fetch(`${BASE_URL}/tv/${tmdbId}?api_key=${API_KEY}&language=id-ID`)
  const data = await res.json()
  return data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null
}

export async function getEpisodeStill(tmdbId, season, episodeNumber) {
  if (!tmdbId) return null
  const res = await fetch(`${BASE_URL}/tv/${tmdbId}/season/${season}/episode/${episodeNumber}?api_key=${API_KEY}`)
  const data = await res.json()
  return data.still_path ? `https://image.tmdb.org/t/p/w400${data.still_path}` : null
}