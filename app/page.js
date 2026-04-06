'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { SkeletonHero, SkeletonSection } from '@/components/Skeleton'

export default function HomePage() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser(payload)

    Promise.all([
      fetch('/api/profile', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/movies').then(r => r.json()),
      fetch('/api/series').then(r => r.json()),
      fetch('https://api.themoviedb.org/3/trending/all/day?language=id-ID', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }
      }).then(r => r.json()).then(d => d.results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : '',
        releaseYear: (item.release_date || item.first_air_date || '').split('-')[0],
        rating: item.vote_average?.toFixed(1),
        type: item.media_type,
      })))
    ]).then(([profileData, moviesData, seriesData, trendingData]) => {
      setUser({ ...profileData, role: profileData.role })
      setMovies(Array.isArray(moviesData) ? moviesData : [])
      setSeries(Array.isArray(seriesData) ? seriesData : [])
      setTrending(Array.isArray(trendingData) ? trendingData : [])
      setLoading(false)
    })
  }, [])

  const logout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.9)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#e50914', letterSpacing: 3 }}>NUSAFLIX</div>
      </nav>
      <SkeletonHero />
      <div style={{ padding: '12px 32px 40px' }}>
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    </div>
  )

  const featured = trending[0] || movies[0]

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
            {user?.role === 'ADMIN' && (
              <span onClick={() => router.push('/admin')} style={{ fontSize: 14, color: '#e50914', cursor: 'pointer', fontWeight: 700 }}>⚙️ Admin</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span onClick={() => router.push('/search')} style={{ fontSize: 20, cursor: 'pointer', color: '#ccc' }}>🔍</span>
          <div onClick={() => router.push('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#1a1a2e', border: '2px solid #e50914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '👤'}
            </div>
            <span style={{ fontSize: 14, color: '#ccc' }}>{user?.name}</span>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: '0.5px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Keluar</button>
        </div>
      </nav>

      {/* Hero — pakai item trending pertama */}
      {featured && (
        <div style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
          <img
            src={featured.backdropUrl || featured.posterUrl}
            alt={featured.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.98) 40%, rgba(10,10,15,0.3) 80%, transparent), linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 60, left: 48, maxWidth: 520 }}>
            {/* Badge trending */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 11, color: '#e50914', fontWeight: 700, letterSpacing: 1 }}>TRENDING HARI INI</span>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 14 }}>{featured.title}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              {featured.rating && <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 14 }}>★ {featured.rating}</span>}
              <span style={{ color: '#aaa', fontSize: 13 }}>{featured.releaseYear}</span>
              <span style={{ background: featured.type === 'tv' ? '#e50914' : '#0f3460', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                {featured.type === 'tv' ? 'SERIES' : 'FILM'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => router.push(featured.type === 'tv' ? `/series/${featured.id}` : `/movie/${featured.id}`)}
                style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 32px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                ▶ Tonton
              </button>
              <button
                onClick={() => router.push(featured.type === 'tv' ? `/series/${featured.id}` : `/movie/${featured.id}`)}
                style={{ background: 'rgba(109,109,110,0.7)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                ⓘ Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div style={{ padding: '12px 32px 40px' }}>

        {/* Trending */}
        {trending.length > 0 && (
          <Section title="🔥 Trending Hari Ini" onSeeAll={() => {}}>
            {trending.map(item => (
              <TrendingCard
                key={`${item.type}-${item.id}`}
                item={item}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)}
              />
            ))}
          </Section>
        )}

        {/* Film dari DB */}
        {movies.length > 0 && (
          <Section title="Film" onSeeAll={() => router.push('/movies')}>
            {movies.map(movie => (
              <MovieCard key={movie.id} item={movie} onClick={() => router.push(`/movie/${movie.id}`)} type="movie" />
            ))}
          </Section>
        )}

        {/* Series dari DB */}
        {series.length > 0 && (
          <Section title="Series" onSeeAll={() => router.push('/series')}>
            {series.map(s => (
              <MovieCard key={s.id} item={s} onClick={() => router.push(`/series/${s.id}`)} type="series" />
            ))}
          </Section>
        )}

        {/* Top 10 dari Trending */}
        {trending.length >= 10 && (
          <Section title="Top 10 Trending" onSeeAll={() => {}}>
            {trending.slice(0, 10).map((item, i) => (
              <TopCard
                key={`top-${item.type}-${item.id}`}
                item={item}
                rank={i + 1}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)}
              />
            ))}
          </Section>
        )}

        {/* Rekomendasi — trending yang belum ditampilkan */}
        {trending.length > 10 && (
          <Section title="Mungkin Kamu Suka" onSeeAll={() => {}}>
            {trending.slice(10).map(item => (
              <TrendingCard
                key={`rek-${item.type}-${item.id}`}
                item={item}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)}
              />
            ))}
          </Section>
        )}

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
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 160, cursor: 'pointer', transition: 'transform 0.2s', transform: hover ? 'scale(1.05)' : 'scale(1)' }}>
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
        <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
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
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 200, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', transform: hover ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.2s' }}>
      <div style={{ fontSize: 100, fontWeight: 900, color: '#1a1a2e', lineHeight: 1, marginRight: -10, zIndex: 1, WebkitTextStroke: '2px #333' }}>{rank}</div>
      <div style={{ borderRadius: 6, overflow: 'hidden', flex: 1 }}>
        <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  )
}

// ── Komponen Trending Card ────────────────────────────
function TrendingCard({ item, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 220, cursor: 'pointer', transition: 'transform 0.2s', transform: hover ? 'scale(1.03)' : 'scale(1)', borderRadius: 8, overflow: 'hidden', background: '#111', position: 'relative' }}>
      <div style={{ position: 'relative', height: 124 }}>
        <img src={item.backdropUrl || item.posterUrl} alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 8, left: 8, background: item.type === 'tv' ? '#e50914' : '#0f3460', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
          {item.type === 'tv' ? 'SERIES' : 'FILM'}
        </div>
        {item.rating && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#ffd700', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
            ★ {item.rating}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 3 }}>{item.title}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{item.releaseYear}</div>
      </div>
      {hover && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 8, pointerEvents: 'none' }} />
      )}
    </div>
  )
}