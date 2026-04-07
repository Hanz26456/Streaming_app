import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updated = await prisma.series.update({
      where: { id: parseInt(id) },
      data: body
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('UPDATE SERIES ERROR:', error)
    return NextResponse.json({ error: 'Gagal mengupdate series' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.series.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Series berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus series' }, { status: 500 })
  }
}
