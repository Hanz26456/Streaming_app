'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'
import MovieCard from '@/components/MovieCard'
import ThemeLangToggle from '@/components/ThemeLangToggle'

const GENRES = [
  'Semua', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 
  'TV Movie', 'Thriller', 'War', 'Western'
]

export default function ExplorePage() {
  const router = useRouter()
  const { colors, lang } = useApp()
  const [selectedGenre, setSelectedGenre] = useState('Semua')
  const [contentType, setContentType] = useState('movie') // 'movie' | 'tv'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    
    // Fetch user profile for navbar
    fetch('/api/profile', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUser(d))
  }, [])

  useEffect(() => {
    setLoading(true)
    const endpoint = contentType === 'movie' ? '/api/movies' : '/api/series'
    const url = `${endpoint}?genre=${selectedGenre}`
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedGenre, contentType])

  const logout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <nav style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '14px 32px', background: colors.bgNav, position: 'sticky', 
        top: 0, zIndex: 100, borderBottom: `0.5px solid ${colors.border}` 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span onClick={() => router.push('/')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>{lang === 'id' ? 'Beranda' : 'Home'}</span>
            <span style={{ fontSize: 14, color: colors.text, fontWeight: 700 }}>{lang === 'id' ? 'Eksplorasi' : 'Explore'}</span>
            <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>Series</span>
            <span onClick={() => router.push('/watchlist')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>❤️ Watchlist</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span onClick={() => router.push('/search')} style={{ fontSize: 20, cursor: 'pointer', color: colors.textMuted }}>🔍</span>
          <ThemeLangToggle />
          <div onClick={() => router.push('/profile')} style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: colors.bgInput, border: '2px solid #e50914', cursor: 'pointer' }}>
             {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>👤</div>}
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            {lang === 'id' ? 'Keluar' : 'Logout'}
          </button>
        </div>
      </nav>

      <main style={{ padding: '32px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24 }}>{lang === 'id' ? 'Eksplorasi Katalog' : 'Explore Catalog'}</h1>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          
          {/* Content Type Switch */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setContentType('movie')}
              style={{
                padding: '10px 24px', borderRadius: 30, border: 'none', fontWeight: 700, cursor: 'pointer',
                background: contentType === 'movie' ? '#e50914' : colors.bgInput,
                color: contentType === 'movie' ? '#fff' : colors.textSub
              }}
            >
              {lang === 'id' ? 'Film' : 'Movies'}
            </button>
            <button 
              onClick={() => setContentType('tv')}
              style={{
                padding: '10px 24px', borderRadius: 30, border: 'none', fontWeight: 700, cursor: 'pointer',
                background: contentType === 'tv' ? '#e50914' : colors.bgInput,
                color: contentType === 'tv' ? '#fff' : colors.textSub
              }}
            >
              Series
            </button>
          </div>

          {/* Genre Chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {GENRES.map(g => (
              <button 
                key={g} 
                onClick={() => setSelectedGenre(g)}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: `1px solid ${selectedGenre === g ? '#e50914' : colors.border}`, 
                  background: selectedGenre === g ? 'rgba(229,9,20,0.1)' : 'transparent',
                  color: selectedGenre === g ? '#e50914' : colors.textSub,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
             {[...Array(12)].map((_, i) => (
                <div key={i} style={{ height: 230, borderRadius: 8, background: colors.bgInput, animation: 'pulse 1.5s infinite' }} />
             ))}
          </div>
        ) : items.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
            {items.map(item => (
              <MovieCard 
                key={item.id} 
                item={item} 
                colors={colors} 
                onClick={() => router.push(contentType === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0', color: colors.textMuted }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
             <h3>{lang === 'id' ? 'Tidak ada konten yang ditemukan' : 'No content found'}</h3>
             <p>{lang === 'id' ? 'Coba pilih genre atau kategori lain.' : 'Try selecting another genre or category.'}</p>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
