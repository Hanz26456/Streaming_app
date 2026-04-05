import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    console.log('=== MOVIE API HIT ===')
    console.log('id:', id)

    const numId = parseInt(id)
    console.log('numId:', numId)

    let movie = await prisma.movie.findUnique({ where: { id: numId } })
    console.log('findUnique result:', movie)

    if (!movie) {
      movie = await prisma.movie.findFirst({ where: { tmdbId: numId } })
      console.log('findFirst tmdbId result:', movie)
    }

    if (!movie) {
      console.log('Fetching from TMDB...')
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${numId}?language=id-ID`,
        { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } }
      )
      console.log('TMDB status:', res.status)
      console.log('TMDB_ACCESS_TOKEN ada?', !!process.env.TMDB_ACCESS_TOKEN)

      if (!res.ok) {
        return NextResponse.json({ error: 'Film tidak ditemukan' }, { status: 404 })
      }

      const d = await res.json()
      console.log('TMDB data title:', d.title)

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
      console.log('Movie saved to DB:', movie.id)
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('ERROR:', error)
    return NextResponse.json({ error: 'Gagal mengambil data film' }, { status: 500 })
  }
}
export async function DELETE(request, { params }) {
  try {
    const { id } = await params  // ✅ await
    await prisma.movie.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Film berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus film' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params  // ✅ await
    const body = await request.json()
    const movie = await prisma.movie.update({ where: { id: parseInt(id) }, data: body })
    return NextResponse.json(movie)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate film' }, { status: 500 })
  }
}
