'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import PaymentModal from '@/components/PaymentModal'
import { SkeletonHero, SkeletonSection } from '@/components/Skeleton'
import { useApp } from '@/context/AppContext'
import ThemeLangToggle from '@/components/ThemeLangToggle'
import ContinueWatchingCard from '@/components/ContinueWatchingCard'

export default function HomePage() {
  const router = useRouter()
  const { colors, lang } = useApp()
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [trending, setTrending] = useState([])
  const [history, setHistory] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser(payload)

    const language = lang === 'id' ? 'id-ID' : 'en-US'

    Promise.all([
      fetch('/api/profile', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
      fetch('/api/movies').then(r => r.json()).catch(() => []),
      fetch('/api/series').then(r => r.json()).catch(() => []),
      fetch(`https://api.themoviedb.org/3/trending/all/day?language=${language}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }
      }).then(r => r.json()).then(d => (d.results || []).map(item => ({
        id: item.id,
        title: item.title || item.name,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : '',
        releaseYear: (item.release_date || item.first_air_date || '').split('-')[0],
        rating: item.vote_average?.toFixed(1),
        type: item.media_type,
      }))).catch(() => []),
      fetch('/api/watch-history?type=continue', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => [])
    ]).then(([profileData, moviesData, seriesData, trendingData, historyData]) => {
      if (profileData) setUser({ ...profileData })
      setMovies(Array.isArray(moviesData) ? moviesData : [])
      setSeries(Array.isArray(seriesData) ? seriesData : [])
      setTrending(Array.isArray(trendingData) ? trendingData : [])
      setHistory(Array.isArray(historyData) ? historyData : [])
      setLoading(false)
    }).catch((err) => {
      console.error('Error loading data:', err)
      setLoading(false)
    })
  }, [lang]) // ← re-fetch kalau bahasa berubah

  const logout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav }}>
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
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav, position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontSize: 14, color: colors.text, fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'id' ? 'Beranda' : 'Home'}
            </span>
            <span onClick={() => router.push('/explore')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>
              {lang === 'id' ? 'Eksplorasi' : 'Explore'}
            </span>
            <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>Series</span>
            <span onClick={() => router.push('/movie')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>
              {lang === 'id' ? 'Film' : 'Movies'}
            </span>
            <span onClick={() => router.push('/watchlist')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>
              ❤️ Watchlist
            </span>
            {user?.role === 'ADMIN' && (
              <span onClick={() => router.push('/admin')} style={{ fontSize: 14, color: '#e50914', cursor: 'pointer', fontWeight: 700 }}>⚙️ Admin</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!user?.isPremium && (
            <button 
              onClick={() => setShowPayment(true)}
              style={{
                background: 'linear-gradient(45deg, #ffd700, #ff8c00)',
                color: '#000', border: 'none', padding: '6px 14px',
                borderRadius: 20, fontWeight: 800, fontSize: 11,
                cursor: 'pointer', boxShadow: '0 2px 10px rgba(255,215,0,0.3)',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              💎 {lang === 'id' ? 'UPGRADE' : 'UPGRADE'}
            </button>
          )}
          <span onClick={() => router.push('/search')} style={{ fontSize: 20, cursor: 'pointer', color: colors.textMuted }}>🔍</span>

          {/* ✅ Toggle Tema & Bahasa */}
          <div style={{ position: 'relative', zIndex: 20 }}>
  <ThemeLangToggle />
</div>

          <div onClick={() => router.push('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: colors.bgInput, border: '2px solid #e50914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '👤'}
            </div>
            <span style={{ fontSize: 14, color: colors.textMuted }}>{user?.name}</span>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            {lang === 'id' ? 'Keluar' : 'Logout'}
          </button>
        </div>
      </nav>

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      {/* Hero */}
      {featured && (
        <div style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
          <img src={featured.backdropUrl || featured.posterUrl} alt={featured.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.98) 40%, rgba(10,10,15,0.3) 80%, transparent), linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 60, left: 48, maxWidth: 520 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 11, color: '#e50914', fontWeight: 700, letterSpacing: 1 }}>
                {lang === 'id' ? 'TRENDING HARI INI' : 'TRENDING TODAY'}
              </span>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 14, color: '#fff' }}>{featured.title}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              {featured.rating && <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 14 }}>★ {featured.rating}</span>}
              <span style={{ color: '#aaa', fontSize: 13 }}>{featured.releaseYear}</span>
              <span style={{ background: featured.type === 'tv' ? '#e50914' : '#0f3460', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                {featured.type === 'tv' ? 'SERIES' : (lang === 'id' ? 'FILM' : 'MOVIE')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push(featured.type === 'tv' ? `/series/${featured.id}` : `/movie/${featured.id}`)}
                style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 32px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                ▶ {lang === 'id' ? 'Tonton' : 'Watch'}
              </button>
              <button onClick={() => router.push(featured.type === 'tv' ? `/series/${featured.id}` : `/movie/${featured.id}`)}
                style={{ background: 'rgba(109,109,110,0.7)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                ⓘ Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div style={{ padding: '12px 32px 40px' }}>

        {history.length > 0 && (
          <Section title={lang === 'id' ? '🍿 Lanjutkan Menonton' : '🍿 Continue Watching'} onSeeAll={() => router.push('/profile')} colors={colors}>
            {history.map(item => (
              <ContinueWatchingCard key={item.id} item={item} />
            ))}
          </Section>
        )}

        {trending.length > 0 && (
          <Section title={lang === 'id' ? '🔥 Trending Hari Ini' : '🔥 Trending Today'} onSeeAll={() => {}} colors={colors}>
            {trending.map(item => (
              <TrendingCard key={`${item.type}-${item.id}`} item={item} colors={colors}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)} />
            ))}
          </Section>
        )}

        {movies.length > 0 && (
          <Section title={lang === 'id' ? 'Film' : 'Movies'} onSeeAll={() => router.push('/movies')} colors={colors}>
            {movies.map(movie => (
              <MovieCard key={movie.id} item={movie} colors={colors} onClick={() => router.push(`/movie/${movie.id}`)} type="movie" />
            ))}
          </Section>
        )}

        {series.length > 0 && (
          <Section title="Series" onSeeAll={() => router.push('/series')} colors={colors}>
            {series.map(s => (
              <MovieCard key={s.id} item={s} colors={colors} onClick={() => router.push(`/series/${s.id}`)} type="series" />
            ))}
          </Section>
        )}

        {trending.length >= 10 && (
          <Section title={lang === 'id' ? 'Top 10 Trending' : 'Top 10 Trending'} onSeeAll={() => {}} colors={colors}>
            {trending.slice(0, 10).map((item, i) => (
              <TopCard key={`top-${item.type}-${item.id}`} item={item} rank={i + 1} colors={colors}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)} />
            ))}
          </Section>
        )}

        {trending.length > 10 && (
          <Section title={lang === 'id' ? 'Mungkin Kamu Suka' : 'You Might Like'} onSeeAll={() => {}} colors={colors}>
            {trending.slice(10).map(item => (
              <TrendingCard key={`rek-${item.type}-${item.id}`} item={item} colors={colors}
                onClick={() => router.push(item.type === 'tv' ? `/series/${item.id}` : `/movie/${item.id}`)} />
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, onSeeAll, children, colors }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{title}</div>
        <span onClick={onSeeAll} style={{ fontSize: 13, color: '#46d369', cursor: 'pointer', fontWeight: 500 }}>Lihat Semua</span>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {children}
      </div>
    </div>
  )
}

function MovieCard({ item, onClick, type, colors }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 160, cursor: 'pointer', transition: 'transform 0.2s', transform: hover ? 'scale(1.05)' : 'scale(1)' }}>
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: colors.cardBg }}>
        <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
        {item.isPremium && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: '#ffd700', color: '#000', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3, pointerEvents: 'none', zIndex: 2 }}>👑 PREMIUM</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#e50914', opacity: hover ? 1 : 0, transition: 'opacity 0.2s' }} />
      </div>
      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: colors.text }}>{item.title}</div>
      {item._count && <div style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>{item._count.episodes} Episode</div>}
      {item.releaseYear && <div style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>{item.releaseYear}</div>}
    </div>
  )
}

function TopCard({ item, rank, onClick, colors }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 200, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', transform: hover ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.2s' }}>
      <div style={{ fontSize: 100, fontWeight: 900, color: colors.cardBg, lineHeight: 1, marginRight: -10, zIndex: 1, WebkitTextStroke: `2px ${colors.borderMuted}` }}>{rank}</div>
      <div style={{ borderRadius: 6, overflow: 'hidden', flex: 1, position: 'relative' }}>
        <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
        {item.isPremium && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: '#ffd700', color: '#000', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 3, pointerEvents: 'none', zIndex: 2 }}>👑</div>
        )}
      </div>
    </div>
  )
}

function TrendingCard({ item, onClick, colors }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flexShrink: 0, width: 220, cursor: 'pointer', transition: 'transform 0.2s', transform: hover ? 'scale(1.03)' : 'scale(1)', borderRadius: 8, overflow: 'hidden', background: colors.bgCard, position: 'relative', border: `0.5px solid ${colors.border}` }}>
      <div style={{ position: 'relative', height: 124 }}>
        <img src={item.backdropUrl || item.posterUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 8, left: 8, background: item.type === 'tv' ? '#e50914' : '#0f3460', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
          {item.type === 'tv' ? 'SERIES' : 'FILM'}
        </div>
        {item.isPremium && (
          <div style={{ position: 'absolute', top: 8, right: 40, background: '#ffd700', color: '#000', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, pointerEvents: 'none', zIndex: 2 }}>👑 PREMIUM</div>
        )}
        {item.rating && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#ffd700', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
            ★ {item.rating}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 3 }}>{item.title}</div>
        <div style={{ fontSize: 11, color: colors.textSub }}>{item.releaseYear}</div>
      </div>
      {hover && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 8, pointerEvents: 'none' }} />
      )}
    </div>
  )
}