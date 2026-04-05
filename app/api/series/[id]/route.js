import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params  // ✅ tambah await di sini

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

    return NextResponse.json(series)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data series' }, { status: 500 })
  }
}