const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Mulai seeding database...')

  // Hapus data lama
  await prisma.episode.deleteMany()
  await prisma.series.deleteMany()
  await prisma.movie.deleteMany()

  // ── SEED MOVIES ──────────────────────────────────────────
  const movies = await prisma.movie.createMany({
    data: [
      { title: 'Langit Merah', description: 'Seorang detektif muda mengungkap konspirasi besar di balik hilangnya ribuan orang di sebuah kota terpencil.', genre: 'Thriller', releaseYear: 2024, duration: 134, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', posterUrl: 'https://picsum.photos/seed/film1/300/450' },
      { title: 'Nusantara Rising', description: 'Epik sejarah tentang perjuangan pahlawan nusantara melawan penjajah di abad ke-18.', genre: 'Drama', releaseYear: 2024, duration: 152, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', posterUrl: 'https://picsum.photos/seed/film2/300/450' },
      { title: 'Rimba Gelap', description: 'Sekelompok ilmuwan terjebak di hutan Amazon dan harus bertahan dari ancaman yang tidak diketahui.', genre: 'Horror', releaseYear: 2023, duration: 118, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', posterUrl: 'https://picsum.photos/seed/film3/300/450' },
      { title: 'Samudra', description: 'Petualangan seorang pelaut muda mengarungi lautan nusantara untuk menemukan pulau legendaris.', genre: 'Adventure', releaseYear: 2024, duration: 127, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', posterUrl: 'https://picsum.photos/seed/film4/300/450' },
      { title: 'Bayangan', description: 'Kisah psikologis tentang seorang wanita yang mulai meragukan realita kehidupannya sendiri.', genre: 'Psychological', releaseYear: 2023, duration: 109, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', posterUrl: 'https://picsum.photos/seed/film5/300/450' },
      { title: 'Api Terakhir', description: 'Di dunia pasca apokalips, seorang ayah berjuang mempertahankan api terakhir peradaban untuk anaknya.', genre: 'Sci-Fi', releaseYear: 2024, duration: 141, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', posterUrl: 'https://picsum.photos/seed/film6/300/450' },
    ]
  })
  console.log(`✅ ${movies.count} film berhasil ditambahkan!`)

  // ── SEED SERIES ──────────────────────────────────────────
  await prisma.series.create({
    data: {
      title: 'Nusantara Chronicles',
      description: 'Serial epik tentang kerajaan-kerajaan Nusantara yang bersatu melawan ancaman dari luar.',
      genre: 'Drama', releaseYear: 2024,
      posterUrl: 'https://picsum.photos/seed/series1/300/450',
      totalSeasons: 2,
      episodes: {
        create: [
          { season: 1, episodeNumber: 1, title: 'Awal Mula', description: 'Perkenalan kerajaan dan tokoh utama.', duration: 48, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep1/400/225' },
          { season: 1, episodeNumber: 2, title: 'Ancaman dari Utara', description: 'Pasukan asing mulai mendekat ke perbatasan.', duration: 52, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep2/400/225' },
          { season: 1, episodeNumber: 3, title: 'Pengkhianat', description: 'Seorang kepercayaan raja ternyata mata-mata musuh.', duration: 50, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep3/400/225' },
          { season: 1, episodeNumber: 4, title: 'Aliansi', description: 'Raja membangun aliansi dengan kerajaan tetangga.', duration: 55, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep4/400/225' },
          { season: 2, episodeNumber: 1, title: 'Kebangkitan', description: 'Satu tahun setelah perang, kerajaan mulai bangkit.', duration: 51, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep5/400/225' },
          { season: 2, episodeNumber: 2, title: 'Dendam Lama', description: 'Musuh lama kembali dengan kekuatan baru.', duration: 49, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep6/400/225' },
        ]
      }
    }
  })

  await prisma.series.create({
    data: {
      title: 'Detektif Bayangan',
      description: 'Seorang detektif eksentrik memecahkan kasus-kasus mustahil di kota Jakarta modern.',
      genre: 'Crime', releaseYear: 2024,
      posterUrl: 'https://picsum.photos/seed/series2/300/450',
      totalSeasons: 1,
      episodes: {
        create: [
          { season: 1, episodeNumber: 1, title: 'Kasus Pertama', description: 'Detektif Raka menerima kasus hilangnya seorang taipan.', duration: 45, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep7/400/225' },
          { season: 1, episodeNumber: 2, title: 'Jejak Palsu', description: 'Semua bukti mengarah ke orang yang salah.', duration: 47, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep8/400/225' },
          { season: 1, episodeNumber: 3, title: 'Di Balik Topeng', description: 'Identitas pelaku mulai terungkap.', duration: 46, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep9/400/225' },
        ]
      }
    }
  })

  await prisma.series.create({
    data: {
      title: 'Pulau Terlarang',
      description: 'Sekelompok remaja terdampar di pulau misterius yang penuh dengan rahasia gelap.',
      genre: 'Mystery', releaseYear: 2023,
      posterUrl: 'https://picsum.photos/seed/series3/300/450',
      totalSeasons: 1,
      episodes: {
        create: [
          { season: 1, episodeNumber: 1, title: 'Terdampar', description: 'Kapal mereka tenggelam dan mereka terdampar di pulau tak dikenal.', duration: 44, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep10/400/225' },
          { season: 1, episodeNumber: 2, title: 'Suara Malam', description: 'Suara aneh terdengar dari dalam hutan setiap malam.', duration: 43, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep11/400/225' },
          { season: 1, episodeNumber: 3, title: 'Peta Kuno', description: 'Mereka menemukan peta yang menunjukkan sesuatu di tengah pulau.', duration: 45, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep12/400/225' },
          { season: 1, episodeNumber: 4, title: 'Rahasia Terkubur', description: 'Rahasia kelam pulau ini akhirnya terungkap.', duration: 50, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://picsum.photos/seed/ep13/400/225' },
        ]
      }
    }
  })

  console.log('✅ 3 series dengan episodes berhasil ditambahkan!')
  console.log('🎉 Seeding selesai!')
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })