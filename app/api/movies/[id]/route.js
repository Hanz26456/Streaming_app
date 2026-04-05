import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const numId = parseInt(id)

    let movie = await prisma.movie.findUnique({ where: { id: numId } })

    if (!movie) {
      movie = await prisma.movie.findFirst({ where: { tmdbId: numId } })
    }

    if (!movie) {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${numId}?language=id-ID`,
        { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
      )
      if (!res.ok) {
        return NextResponse.json({ error: 'Film tidak ditemukan' }, { status: 404 })
      }
      const d = await res.json()
      movie = await prisma.movie.create({
        data: {
          tmdbId: d.id,
          title: d.title,
          description: d.overview || '',
          genre: d.genres?.map(g => g.name).join(', ') || 'Umum',
          releaseYear: d.release_date ? parseInt(d.release_date.split('-')[0]) : 0,
          duration: d.runtime || 0,
          videoUrl: '',
          posterUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
          backdropUrl: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
        }
      })
    }

    // ✅ Trailer fetch di DALAM fungsi GET
    let trailerKey = null
    try {
      const trailerRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId || numId}/videos?language=en-US`,
        { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
      )
      const trailerData = await trailerRes.json()
      const trailer = trailerData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      trailerKey = trailer?.key || null
    } catch (e) {
      console.log('Trailer fetch gagal:', e)
    }

    return NextResponse.json({ ...movie, trailerKey })

  } catch (error) {
    console.error('ERROR:', error)
    return NextResponse.json({ error: 'Gagal mengambil data film' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.movie.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Film berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus film' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const movie = await prisma.movie.update({ where: { id: parseInt(id) }, data: body })
    return NextResponse.json(movie)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate film' }, { status: 500 })
  }
}