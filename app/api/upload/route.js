import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'

function getUserId(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.id
  } catch { return null }
}

export async function POST(request) {
  const userId = getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF' },
        { status: 400 }
      )
    }

    // Validasi ukuran (maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Nama file unik: avatar_{userId}_{timestamp}.{ext}
    const originalName = file.name || 'upload'
    const ext = originalName.split('.').pop().toLowerCase()
    const filename = `avatar_${userId}_${Date.now()}.${ext}`

    // Pastikan folder /public/uploads ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Tulis file ke disk
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Kembalikan URL publik
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })

  } catch (error) {
    console.error('[UPLOAD ERROR]', error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}