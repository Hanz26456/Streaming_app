import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const movies = await prisma.movie.createMany({
    data: [
      {
        title: 'Langit Merah',
        description: 'Seorang detektif muda mengungkap konspirasi besar di balik hilangnya ribuan orang di sebuah kota terpencil.',
        genre: 'Thriller',
        releaseYear: 2024,
        duration: 134,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film1/300/450'
      },
      {
        title: 'Nusantara Rising',
        description: 'Epik sejarah tentang perjuangan pahlawan nusantara melawan penjajah di abad ke-18.',
        genre: 'Drama',
        releaseYear: 2024,
        duration: 152,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film2/300/450'
      },
      {
        title: 'Rimba Gelap',
        description: 'Sekelompok ilmuwan terjebak di hutan Amazon dan harus bertahan dari ancaman yang tidak diketahui.',
        genre: 'Horror',
        releaseYear: 2023,
        duration: 118,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film3/300/450'
      },
      {
        title: 'Samudra',
        description: 'Petualangan seorang pelaut muda mengarungi lautan nusantara untuk menemukan pulau legendaris.',
        genre: 'Adventure',
        releaseYear: 2024,
        duration: 127,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film4/300/450'
      },
      {
        title: 'Bayangan',
        description: 'Kisah psikologis tentang seorang wanita yang mulai meragukan realita kehidupannya sendiri.',
        genre: 'Psychological',
        releaseYear: 2023,
        duration: 109,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film5/300/450'
      },
      {
        title: 'Api Terakhir',
        description: 'Di dunia pasca apokalips, seorang ayah berjuang mempertahankan api terakhir peradaban untuk anaknya.',
        genre: 'Sci-Fi',
        releaseYear: 2024,
        duration: 141,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://picsum.photos/seed/film6/300/450'
      }
    ]
  })
  return NextResponse.json({ message: `${movies.count} film berhasil ditambahkan!` })
}