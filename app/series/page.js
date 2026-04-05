'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function SeriesPage() {
  const router = useRouter()
  const [seriesList, setSeriesList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const token = Cookies.get('token')
  if (!token) { router.push('/login'); return }

  fetch('/api/series')
    .then(r => r.json())
    .then(data => {
      console.log('DATA:', data) // debug
      setSeriesList(data)
      setLoading(false) // 🔥 INI WAJIB
    })
}, [])

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 16 }}>Memuat series...</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span onClick={() => router.push('/')} style={{ color: '#ccc', cursor: 'pointer', fontSize: 14 }}>Beranda</span>
          <span style={{ color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Series</span>
          <span onClick={() => router.push('/movies')} style={{ color: '#ccc', cursor: 'pointer', fontSize: 14 }}>Film</span>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Series</h1>
        <p style={{ color: '#aaa', marginBottom: 32, fontSize: 14 }}>Semua serial tersedia di NusaFlix</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {seriesList.map(series => (
            <div
              key={series.id}
              onClick={() => router.push(`/series/${series.id}`)}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', background: '#1a1a2e', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={series.posterUrl || `https://picsum.photos/seed/${series.id}/300/450`}
                  alt={series.title}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 8, right: 8, background: '#e50914', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  SERIES
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{series.title}</div>
                <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {series.description}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#333', color: '#ccc', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{series.genre}</span>
                  <span style={{ background: '#333', color: '#ccc', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{series._count?.episodes || 0} Episode</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}