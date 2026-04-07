'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import WatchlistButton from '@/components/WatchListButton'
import { useApp } from '@/context/AppContext'
import ReviewSection from '@/components/ReviewSection'
import CastSection from '@/components/CastSection'
import MovieCard from '@/components/MovieCard'
import MovieSection from '@/components/MovieSection'

export default function SeriesDetailPage() {
  const { colors, lang } = useApp()
  const router = useRouter()
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState(1)
  const [showTrailer, setShowTrailer] = useState(false)  // ✅ tambah

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    fetch(`/api/series/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error && Array.isArray(data.episodes)) {
          setSeries(data)
        } else {
          setSeries(null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: colors.text, fontSize: 15 }}>{lang === 'id' ? 'Memuat series...' : 'Loading series...'}</div>
    </div>
  )

  if (!series) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ color: colors.text, fontSize: 16 }}>{lang === 'id' ? 'Series tidak ditemukan' : 'Series not found'}</div>
      <button onClick={() => router.back()} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}>{lang === 'id' ? 'Kembali' : 'Back'}</button>
    </div>
  )

  const seasons = [...new Set(series.episodes.map(ep => ep.season))].sort()
  const filteredEpisodes = series.episodes.filter(ep => ep.season === activeSeason)
  const backdrop = series.backdropUrl || series.posterUrl

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav, position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${colors.border}` }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/series')} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Series</button>
          <button onClick={() => router.push('/explore')} style={{ background: 'transparent', border: `1px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>{lang === 'id' ? 'Eksplorasi' : 'Explore'}</button>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>{lang === 'id' ? 'Beranda' : 'Home'}</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
        {backdrop && (
          <img src={backdrop} alt={series.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.98) 35%, rgba(10,10,15,0.4) 70%, transparent), linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 40%)' }} />
        <div style={{ position: 'absolute', bottom: 44, left: 32, maxWidth: 520, display: 'flex', gap: 24, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: '#e50914', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>★ SERIES</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 10, lineHeight: 1.05 }}>{series.title}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {series.genre && <span style={{ background: '#e50914', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{series.genre}</span>}
              {series.releaseYear && <span style={{ color: '#aaa', fontSize: 13 }}>{series.releaseYear}</span>}
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: '#aaa', fontSize: 13 }}>{seasons.length} Season</span>
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: '#aaa', fontSize: 13 }}>{series.episodes.length} Episode</span>
            </div>
            <p style={{ color: '#bbb', fontSize: 14, lineHeight: 1.65, marginBottom: 20, maxWidth: 460 }}>
              {series.description?.length > 200 ? series.description.slice(0, 200) + '...' : series.description}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {series.episodes.length > 0 && (
                <button onClick={() => router.push(`/series/${id}/episode/${series.episodes[0].id}`)}
                  style={{ background: '#fff', color: '#000', border: 'none', padding: '11px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ▶ {lang === 'id' ? 'Putar Episode 1' : 'Play Episode 1'}
                </button>
              )}
              {/* ✅ Tombol Trailer */}
              {series.trailerKey && (
                <button onClick={() => setShowTrailer(!showTrailer)}
                  style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '11px 20px', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  🎬 {showTrailer ? (lang === 'id' ? 'Tutup Trailer' : 'Close Trailer') : (lang === 'id' ? 'Tonton Trailer' : 'Watch Trailer')}
                </button>
              )}
              <WatchlistButton seriesId={series.id} tmdbSeriesId={series.tmdbId} />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Section Trailer */}
      {series.trailerKey && showTrailer && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px 0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: colors.text }}>🎬 {lang === 'id' ? 'Trailer Resmi' : 'Official Trailer'}</h3>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 8, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${series.trailerKey}?autoplay=1`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast & Crew from TMDB */}
      <div style={{ padding: '0 32px', maxWidth: 1000 }}>
        <CastSection cast={series.cast} />
      </div>

      {/* Episode List */}
      <div style={{ padding: '32px 32px', maxWidth: 1000 }}>

        {/* Season Tabs */}
        {seasons.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {seasons.map(season => (
              <button key={season} onClick={() => setActiveSeason(season)}
                style={{ background: activeSeason === season ? '#e50914' : colors.bgInput, color: activeSeason === season ? '#fff' : colors.textSub, border: activeSeason === season ? 'none' : `0.5px solid ${colors.borderMuted}`, padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Season {season}
              </button>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: colors.text }}>
          Season {activeSeason} <span style={{ color: colors.textSub, fontWeight: 400, fontSize: 14 }}>— {filteredEpisodes.length} Episode</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredEpisodes.map(ep => (
            <div key={ep.id} onClick={() => router.push(`/series/${id}/episode/${ep.id}`)}
              style={{ display: 'flex', gap: 16, alignItems: 'center', background: colors.cardBg, borderRadius: 8, padding: '12px 16px', cursor: 'pointer', border: `0.5px solid ${colors.border}`, transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderMuted; e.currentTarget.style.background = colors.bgInput }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = colors.cardBg }}>

              <div style={{ fontSize: 20, fontWeight: 800, color: colors.textSub, minWidth: 32, textAlign: 'center' }}>
                {ep.episodeNumber}
              </div>

              <div style={{ position: 'relative', minWidth: 150, height: 85, borderRadius: 6, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                <img src={ep.thumbnailUrl || `https://picsum.photos/seed/ep${ep.id}/400/225`} alt={ep.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>▶</div>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: colors.text }}>{ep.title}</div>
                <div style={{ color: colors.textSub, fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ep.description || (lang === 'id' ? 'Tidak ada deskripsi' : 'No description')}
                </div>
              </div>

              <div style={{ color: colors.textMuted, fontSize: 12, flexShrink: 0 }}>
                {ep.duration ? `${ep.duration} ${lang === 'id' ? 'mnt' : 'min'}` : ''}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <CastSection cast={series.cast} />
        </div>

        {/* Recommendations */}
        {series.recommendations && series.recommendations.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <MovieSection title={lang === 'id' ? '🍿 Mungkin Anda Juga Suka' : '🍿 You Might Also Like'} colors={colors}>
              {series.recommendations.map(rec => (
                <MovieCard 
                  key={rec.id} 
                  item={rec} 
                  colors={colors} 
                  onClick={() => router.push(`/series/${rec.id}`)} 
                />
              ))}
            </MovieSection>
          </div>
        )}

        {/* Reviews */}
      </div>
    </div>
  )
}