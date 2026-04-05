import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

function getUserId(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.id
  } catch {
    return null
  }
}

// Helper: fetch & upsert Movie dari TMDB ke DB lokal
async function syncMovieFromTMDB(tmdbId) {
  // Cek dulu di DB
  const existing = await prisma.movie.findFirst({ where: { tmdbId } })
  if (existing) return existing

  // Fetch dari TMDB
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?language=id-ID`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
  )
  if (!res.ok) throw new Error('Gagal fetch TMDB movie')
  const d = await res.json()

  return await prisma.movie.create({
    data: {
      tmdbId: d.id,
      title: d.title,
      description: d.overview || '',
      genre: d.genres?.map(g => g.name).join(', ') || 'Umum',
      releaseYear: d.release_date ? parseInt(d.release_date.split('-')[0]) : 0,
      duration: d.runtime || 0,
      videoUrl: '',   // isi sesuai kebutuhan kamu
      posterUrl: d.poster_path
        ? `https://image.tmdb.org/t/p/w500${d.poster_path}`
        : '',
      backdropUrl: d.backdrop_path
        ? `https://image.tmdb.org/t/p/original${d.backdrop_path}`
        : null,
    }
  })
}

// Helper: fetch & upsert Series dari TMDB ke DB lokal
async function syncSeriesFromTMDB(tmdbId) {
  const existing = await prisma.series.findFirst({ where: { tmdbId } })
  if (existing) return existing

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${tmdbId}?language=id-ID`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
  )
  if (!res.ok) throw new Error('Gagal fetch TMDB series')
  const d = await res.json()

  return await prisma.series.create({
    data: {
      tmdbId: d.id,
      title: d.name,
      description: d.overview || '',
      genre: d.genres?.map(g => g.name).join(', ') || 'Umum',
      releaseYear: d.first_air_date ? parseInt(d.first_air_date.split('-')[0]) : 0,
      posterUrl: d.poster_path
        ? `https://image.tmdb.org/t/p/w500${d.poster_path}`
        : '',
      backdropUrl: d.backdrop_path
        ? `https://image.tmdb.org/t/p/original${d.backdrop_path}`
        : null,
      totalSeasons: d.number_of_seasons || 1,
    }
  })
}

// GET — ambil semua watchlist user
export async function GET(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
      include: {
        movie: true,
        series: { include: { _count: { select: { episodes: true } } } }
      }
    })
    return NextResponse.json(watchlist)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil watchlist' }, { status: 500 })
  }
}

// POST — tambah ke watchlist (dengan auto-sync TMDB)
export async function POST(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Terima tmdbId + type, ATAU movieId/seriesId langsung (DB id)
    const body = await request.json()
    const { tmdbMovieId, tmdbSeriesId, movieId, seriesId } = body

    let finalMovieId = movieId || null
    let finalSeriesId = seriesId || null

    // Auto-sync dari TMDB kalau pakai tmdbId
    if (tmdbMovieId) {
      const movie = await syncMovieFromTMDB(Number(tmdbMovieId))
      finalMovieId = movie.id
    }
    if (tmdbSeriesId) {
      const series = await syncSeriesFromTMDB(Number(tmdbSeriesId))
      finalSeriesId = series.id
    }

    if (!finalMovieId && !finalSeriesId) {
      return NextResponse.json({ error: 'tmdbMovieId, tmdbSeriesId, movieId, atau seriesId wajib diisi' }, { status: 400 })
    }

    const item = await prisma.watchlist.create({
      data: {
        userId,
        movieId: finalMovieId,
        seriesId: finalSeriesId,
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Sudah ada di watchlist' }, { status: 200 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambahkan ke watchlist' }, { status: 500 })
  }
}

// DELETE — hapus dari watchlist
export async function DELETE(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { movieId, seriesId } = await request.json()

    await prisma.watchlist.deleteMany({
      where: {
        userId,
        ...(movieId ? { movieId } : {}),
        ...(seriesId ? { seriesId } : {}),
      }
    })
    return NextResponse.json({ message: 'Dihapus dari watchlist' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus dari watchlist' }, { status: 500 })
  }
}