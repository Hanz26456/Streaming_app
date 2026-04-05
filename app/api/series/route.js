import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('API SERIES KEHIT!') // 🔥 debug

  try {
    const series = await prisma.series.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { episodes: true } }
      }
    })

    return NextResponse.json(series)
  } catch (error) {
    console.log('ERROR SERIES:', error) // 🔥 debug error
    return NextResponse.json({ error: 'Gagal mengambil data series' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, genre, releaseYear, posterUrl, totalSeasons } = body

    if (!title) {
      return NextResponse.json({ error: 'Title wajib diisi' }, { status: 400 })
    }

    const series = await prisma.series.create({
      data: { title, description, genre, releaseYear, posterUrl, totalSeasons }
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.log('ERROR POST SERIES:', error)
    return NextResponse.json({ error: 'Gagal menambahkan series' }, { status: 500 })
  }
}