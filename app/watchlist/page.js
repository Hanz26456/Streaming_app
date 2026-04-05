'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function WatchlistPage() {
  const router = useRouter()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | movie | series

  const getToken = () => Cookies.get('token')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    fetchWatchlist(token)
  }, [])

  const fetchWatchlist = (token) => {
    fetch('/api/watchlist', {
      headers: { authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setWatchlist(data); setLoading(false) })
  }

  const removeFromWatchlist = async (movieId, seriesId) => {
    const token = getToken()
    await fetch('/api/watchlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ movieId, seriesId })
    })
    setWatchlist(prev => prev.filter(w => {
      if (movieId) return w.movieId !== movieId
      if (seriesId) return w.seriesId !== seriesId
      return true
    }))
  }

  const filtered = watchlist.filter(w => {
    if (filter === 'movie') return w.movie !== null
    if (filter === 'series') return w.series !== null
    return true
  })

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff' }}>Memuat watchlist...</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span onClick={() => router.push('/')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Beranda</span>
          <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Series</span>
          <span onClick={() => router.push('/search')} style={{ fontSize: 20, cursor: 'pointer', color: '#ccc' }}>🔍</span>
        </div>
      </nav>

      <div style={{ padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>❤️ Watchlist Saya</h1>
          <p style={{ color: '#aaa', fontSize: 14 }}>{watchlist.length} item tersimpan</p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[
            { label: 'Semua', value: 'all' },
            { label: '🎬 Film', value: 'movie' },
            { label: '📺 Series', value: 'series' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              background: filter === f.value ? '#e50914' : '#1a1a2e',
              color: '#fff', border: 'none', padding: '7px 18px',
              borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Kosong */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>❤️</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#777' }}>Watchlist masih kosong</div>
            <div style={{ fontSize: 14, marginBottom: 24 }}>Tambahkan film atau series favoritmu</div>
            <button onClick={() => router.push('/')} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
              Jelajahi Konten
            </button>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
          {filtered.map(w => {
            const item = w.movie || w.series
            const isMovie = !!w.movie
            if (!item) return null

            return (
              <div key={w.id} style={{ borderRadius: 8, overflow: 'hidden', background: '#111', position: 'relative' }}>
                {/* Poster */}
                <div
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => router.push(isMovie ? `/movie/${item.id}` : `/series/${item.id}`)}
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
                  />
                  {/* Badge */}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: isMovie ? '#0f3460' : '#e50914', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                    {isMovie ? 'FILM' : 'SERIES'}
                  </div>
                  {/* Play overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.opacity = 1 }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0 }}
                  >
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#e0e0e0' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
                    {item.genre} • {item.releaseYear}
                    {isMovie && ` • ${item.duration} mnt`}
                    {!isMovie && item._count && ` • ${item._count.episodes} ep`}
                  </div>
                  {/* Hapus */}
                  <button
                    onClick={() => removeFromWatchlist(w.movieId, w.seriesId)}
                    style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '6px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#e50914'; e.currentTarget.style.color = '#e50914' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa' }}
                  >
                    🗑 Hapus dari Watchlist
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}