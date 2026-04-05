'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function HomePage() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser(payload)

    // Fetch movies + series sekaligus
   // SESUDAH
Promise.all([
  fetch('/api/profile', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json()),
  fetch('/api/movies').then(r => r.json()),
  fetch('/api/series').then(r => r.json()),
]).then(([profileData, moviesData, seriesData]) => {
  setUser(profileData)
  setMovies(Array.isArray(moviesData) ? moviesData : moviesData.data || [])   // ← fix
  setSeries(Array.isArray(seriesData) ? seriesData : seriesData.data || [])   // ← fix
  setLoading(false)
})
  }, [])
  const logout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 16 }}>Memuat...</div>
    </div>
  )

  const featured = movies[0]

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>NUSAFLIX</div>
    <div style={{ display: 'flex', gap: 20 }}>
      <span style={{ fontSize: 14, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Beranda</span>
      <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Series</span>
      <span onClick={() => router.push('/movie')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Film</span>
      <span onClick={() => router.push('/watchlist')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>❤️ Watchlist</span>
    </div>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <span onClick={() => router.push('/search')} style={{ fontSize: 20, cursor: 'pointer', color: '#ccc' }}>🔍</span>  {/* ← TAMBAHAN */}
   <div
  onClick={() => router.push('/profile')}
  style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
>
  {/* Avatar */}
  <div style={{
    width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
    background: '#1a1a2e', border: '2px solid #e50914',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0
  }}>
    {user?.avatarUrl
      ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      : '👤'
    }
  </div>
  <span style={{ fontSize: 14, color: '#ccc' }}>{user?.name}</span>
</div>
    <button onClick={logout} style={{ background: 'transparent', border: '0.5px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Keluar</button>
  </div>
</nav>

      {/* Hero */}
      {featured && (
        <div style={{ position: 'relative', height: 480, background: 'linear-gradient(135deg, #1a0a2e, #0f3460)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
          <img src={featured.posterUrl} alt={featured.title}
            style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', objectFit: 'cover', opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,1) 45%, transparent)' }} />
          <div style={{ position: 'relative', padding: '0 48px 48px', maxWidth: 520 }}>
            <div style={{ fontSize: 11, color: '#e50914', letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>★ FILM PILIHAN MINGGU INI</div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>{featured.title}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#46d369', fontWeight: 700, fontSize: 14 }}>97% Match</span>
              <span style={{ color: '#aaa', fontSize: 13 }}>{featured.releaseYear}</span>
              <span style={{ border: '1px solid #aaa', color: '#aaa', fontSize: 11, padding: '1px 5px', borderRadius: 2 }}>17+</span>
              <span style={{ color: '#aaa', fontSize: 13 }}>{Math.floor(featured.duration / 60)}j {featured.duration % 60}m</span>
            </div>
            <div style={{ fontSize: 14, color: '#ddd', lineHeight: 1.7, marginBottom: 24 }}>{featured.description}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push(`/movie/${featured.id}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '11px 28px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>▶ Putar</button>
              <button onClick={() => router.push(`/movie/${featured.id}`)} style={{ background: 'rgba(109,109,110,0.7)', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 6, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>ⓘ Info Lainnya</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div style={{ padding: '12px 32px 40px' }}>

        {/* Section: Lanjut Ditonton (semua film) */}
        <Section title="Semua Film" onSeeAll={() => {}}>
          {movies.map(movie => (
            <MovieCard key={movie.id} item={movie} onClick={() => router.push(`/movie/${movie.id}`)} type="movie" />
          ))}
        </Section>

        {/* Section: Series */}
        {series.length > 0 && (
          <Section title="Series" onSeeAll={() => router.push('/series')}>
            {series.map(s => (
              <MovieCard key={s.id} item={s} onClick={() => router.push(`/series/${s.id}`)} type="series" />
            ))}
          </Section>
        )}

        {/* Section: Top 10 */}
        <Section title="Top 10 di Indonesia Hari Ini" onSeeAll={() => {}}>
          {movies.slice(0, 5).map((movie, i) => (
            <TopCard key={movie.id} item={movie} rank={i + 1} onClick={() => router.push(`/movie/${movie.id}`)} />
          ))}
        </Section>

        {/* Section: Rekomendasi (genre acak) */}
        <Section title="Direkomendasikan Untuk Anda" onSeeAll={() => {}}>
          {[...movies].reverse().map(movie => (
            <MovieCard key={movie.id} item={movie} onClick={() => router.push(`/movie/${movie.id}`)} type="movie" />
          ))}
        </Section>

      </div>

    </div>
  )
}

// ── Komponen Section ──────────────────────────────────
function Section({ title, onSeeAll, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e8e8e8' }}>{title}</div>
        <span onClick={onSeeAll} style={{ fontSize: 13, color: '#46d369', cursor: 'pointer', fontWeight: 500 }}>Lihat Semua</span>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {children}
      </div>
    </div>
  )
}

// ── Komponen Movie/Series Card ────────────────────────
function MovieCard({ item, onClick, type }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 160, cursor: 'pointer', transition: 'transform 0.2s', transform: hover ? 'scale(1.05)' : 'scale(1)', position: 'relative' }}
    >
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
        <img src={item.posterUrl} alt={item.title}
          style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
        {type === 'series' && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: '#e50914', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>SERIES</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#e50914', opacity: hover ? 1 : 0, transition: 'opacity 0.2s' }} />
      </div>
      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{item.title}</div>
      {item._count && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item._count.episodes} Episode</div>}
      {item.duration && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.releaseYear} • {item.duration} mnt</div>}
    </div>
  )
}

// ── Komponen Top 10 Card ──────────────────────────────
function TopCard({ item, rank, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 200, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', gap: 0, transform: hover ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.2s' }}
    >
      <div style={{ fontSize: 100, fontWeight: 900, color: '#1a1a2e', lineHeight: 1, marginRight: -10, zIndex: 1, WebkitTextStroke: '2px #333' }}>{rank}</div>
      <div style={{ borderRadius: 6, overflow: 'hidden', flex: 1 }}>
        <img src={item.posterUrl} alt={item.title}
          style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  )
}