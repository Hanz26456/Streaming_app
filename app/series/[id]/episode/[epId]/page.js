'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'
import PremiumGate from '@/components/PremiumGate'
import PaymentModal from '@/components/PaymentModal'

export default function EpisodePage() {
  const { colors, lang } = useApp()
  const router = useRouter()
  const { id, epId } = useParams()
  const [series, setSeries] = useState(null)
  const [episode, setEpisode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const controlsTimer = useRef(null)
  const [profile, setProfile] = useState(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    let mounted = true
    
    // Fetch all needed data
    Promise.all([
      fetch(`/api/series/${id}`).then(r => r.json()),
      fetch('/api/profile', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/watch-history', { headers: { authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([seriesData, profileData, history]) => {
      if (!mounted) return
      
      setSeries(seriesData)
      setProfile(profileData)

      if (seriesData?.episodes && Array.isArray(seriesData.episodes)) {
        const ep = seriesData.episodes.find(e => Number(e.id) === Number(epId))
        setEpisode(ep)
      }

      if (Array.isArray(history)) {
        const item = history.find(h => h.episodeId === parseInt(epId))
        if (item && item.progress > 0) {
          setProgress(item.progress)
        }
      }

      setLoading(false)
    }).catch(err => {
      console.error(err)
      if (mounted) setLoading(false)
    })

    return () => { mounted = false }
  }, [id, epId])

  // Sync video time when metadata is loaded
  useEffect(() => {
    if (videoRef.current && progress > 0) {
      videoRef.current.currentTime = progress
    }
  }, [episode, progress])

  // Save progress periodically
  useEffect(() => {
    let interval
    if (playing) {
      interval = setInterval(saveProgress, 10000)
    }
    return () => clearInterval(interval)
  }, [playing, progress, duration])

  const saveProgress = async () => {
    if (!videoRef.current || !episode) return
    const currentPos = videoRef.current.currentTime
    const totalDur = videoRef.current.duration
    const token = Cookies.get('token')
    
    fetch('/api/watch-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({
        episodeId: parseInt(epId),
        seriesId: parseInt(id),
        progress: currentPos,
        duration: totalDur
      })
    })
  }

  const handlePlayClick = () => {
    if (series?.isPremium && !profile?.isPremium) {
      setShowPayment(true)
      return
    }
    togglePlay()
  }

  const togglePlay = async () => {
    if (!videoRef.current) return
    try {
      if (playing) { videoRef.current.pause(); setPlaying(false) }
      else { await videoRef.current.play(); setPlaying(true) }
    } catch (err) { console.error(err) }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => { if (playing) setShowControls(false) }, 3000)
  }

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) { videoRef.current.currentTime = val; setProgress(val) }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  const episodes = series?.episodes || []
  const currentIndex = episodes.findIndex(e => Number(e.id) === Number(epId))
  const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : null
  const nextEp = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text }}>
      {lang === 'id' ? 'Memuat episode...' : 'Loading episode...'}
    </div>
  )

  if (!series || !episode) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: colors.text }}>
      <div>{lang === 'id' ? 'Episode tidak ditemukan' : 'Episode not found'}</div>
      <button onClick={() => router.push(`/series/${id}`)} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}>{lang === 'id' ? 'Kembali ke Series' : 'Back to Series'}</button>
    </div>
  )

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', background: colors.bgNav, borderBottom: `0.5px solid ${colors.border}` }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 20, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: colors.text, fontWeight: 500 }}>{series.title}</span>
            {series.isPremium && (
              <span style={{ background: 'linear-gradient(45deg, #ffd700, #ff8c00)', color: '#000', fontSize: 9, fontWeight: 900, padding: '1px 6px', borderRadius: 3 }}>👑 PREMIUM</span>
            )}
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            S{episode.season} E{episode.episodeNumber} — {episode.title}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!profile?.isPremium && (
            <button 
              onClick={() => setShowPayment(true)}
              style={{
                background: 'linear-gradient(45deg, #ffd700, #ff8c00)',
                color: '#000', border: 'none', padding: '6px 14px',
                borderRadius: 20, fontWeight: 800, fontSize: 11,
                cursor: 'pointer', boxShadow: '0 2px 10px rgba(255,215,0,0.3)'
              }}
            >
              💎 {lang === 'id' ? 'UPGRADE' : 'UPGRADE'}
            </button>
          )}
          <button onClick={() => router.push(`/series/${id}`)}
            style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            ← {series.title}
          </button>
        </div>
      </nav>

      {/* Video Player */}
      <div ref={playerRef} onMouseMove={handleMouseMove}
        style={{ position: 'relative', background: '#000', width: '100%', maxWidth: 1100, margin: '0 auto', aspectRatio: '16/9', overflow: 'hidden' }}>
        
        {/* Gate Konten Premium */}
        {series?.isPremium && !profile?.isPremium && (
          <PremiumGate onUpgrade={() => setShowPayment(true)} />
        )}

        <video ref={videoRef} src={episode.videoUrl}
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          onTimeUpdate={() => videoRef.current && setProgress(videoRef.current.currentTime)}
          onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => { setPlaying(false); saveProgress() }}
          onClick={togglePlay}
          onEnded={() => { setPlaying(false); saveProgress(); if (nextEp) router.push(`/series/${id}/episode/${nextEp.id}`) }}
        />

        {/* Play overlay */}
        {!playing && (
          <div onClick={handlePlayClick} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', cursor: 'pointer' }}>
            {series?.isPremium && !profile?.isPremium ? (
               <div style={{ background: 'linear-gradient(45deg, #ffd700, #ff8c00)', color: '#000', padding: '12px 24px', borderRadius: 30, fontWeight: 800, fontSize: 15, boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
                 👑 {lang === 'id' ? 'Berlangganan untuk Menonton' : 'Subscribe to Watch'}
               </div>
            ) : (
               <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>▶</div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '32px 20px 14px', opacity: showControls ? 1 : 0, transition: 'opacity 0.3s' }}>
          <input type="range" min="0" max={duration || 100} value={progress} step="0.5"
            onChange={handleSeek}
            style={{ width: '100%', accentColor: '#e50914', cursor: 'pointer', marginBottom: 10 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={handlePlayClick} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: 0 }}>
                {series?.isPremium && !profile?.isPremium ? '👑' : (playing ? '⏸' : '▶')}
              </button>
              {prevEp && (
                <button onClick={() => router.push(`/series/${id}/episode/${prevEp.id}`)}
                  style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                  ⏮ Ep {prevEp.episodeNumber}
                </button>
              )}
              {nextEp && (
                <button onClick={() => router.push(`/series/${id}/episode/${nextEp.id}`)}
                  style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                  Ep {nextEp.episodeNumber} ⏭
                </button>
              )}
              <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted) } }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 0 }}>
                {muted ? '🔇' : '🔊'}
              </button>
              <span style={{ fontSize: 13, color: '#aaa' }}>{formatTime(progress)} / {formatTime(duration)}</span>
            </div>
            <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 0 }}>⛶</button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: colors.textSub, marginBottom: 6 }}>
              {series.title} · Season {episode.season} · Episode {episode.episodeNumber}
              {episode.duration ? ` · ${episode.duration} mnt` : ''}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: colors.text }}>{episode.title}</h1>
            <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7 }}>{episode.description || (lang === 'id' ? 'Tidak ada deskripsi.' : 'No description.')}</p>
          </div>

          {/* Next episode card */}
          {nextEp && (
            <div onClick={() => router.push(`/series/${id}/episode/${nextEp.id}`)}
              style={{ background: colors.cardBg, border: `0.5px solid ${colors.border}`, borderRadius: 8, padding: 14, cursor: 'pointer', minWidth: 220, maxWidth: 260 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#e50914'}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
              <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 6 }}>{lang === 'id' ? 'Episode Berikutnya' : 'Next Episode'}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: colors.text }}>Ep {nextEp.episodeNumber} — {nextEp.title}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {nextEp.description || ''}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#e50914', fontWeight: 600 }}>{lang === 'id' ? 'Putar Sekarang →' : 'Play Now →'}</div>
            </div>
          )}
        </div>

        {/* Episode list singkat */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: colors.textSub }}>{lang === 'id' ? 'Episode Lainnya' : 'Other Episodes'} — Season {episode.season}</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {episodes.filter(e => e.season === episode.season).map(ep => (
              <div key={ep.id} onClick={() => router.push(`/series/${id}/episode/${ep.id}`)}
                style={{ flexShrink: 0, width: 160, cursor: 'pointer', opacity: Number(ep.id) === Number(epId) ? 1 : 0.65, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = Number(ep.id) === Number(epId) ? '1' : '0.65'}>
                <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', height: 90, background: colors.bgInput, border: Number(ep.id) === Number(epId) ? '2px solid #e50914' : `1px solid ${colors.borderMuted}` }}>
                  <img src={ep.thumbnailUrl || `https://picsum.photos/seed/ep${ep.id}/400/225`} alt={ep.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {Number(ep.id) === Number(epId) && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(229,9,20,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>▶</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 5, color: Number(ep.id) === Number(epId) ? '#e50914' : colors.textMuted }}>
                  Ep {ep.episodeNumber} — {ep.title?.length > 20 ? ep.title.slice(0, 20) + '...' : ep.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

    </div>
  )
}