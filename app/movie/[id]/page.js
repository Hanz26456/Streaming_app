'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import WatchlistButton from '@/components/WatchListButton'

export default function MoviePage() {
  const router = useRouter()
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    fetch(`/api/movies/${id}`)
      .then(r => r.json())
      .then(data => { setMovie(data); setLoading(false) })
  }, [id])

  const togglePlay = async () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      try { await videoRef.current.play(); setPlaying(true) }
      catch (e) { console.log(e) }
    } else {
      videoRef.current.pause(); setPlaying(false)
    }
  }

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) { videoRef.current.currentTime = val; setProgress(val) }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { playerRef.current?.requestFullscreen() }
    else { document.exitFullscreen() }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  const hasVideo = movie?.videoUrl && movie.videoUrl.trim() !== ''

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff' }}>Memuat film...</div>
    </div>
  )

  if (!movie || movie.error) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff' }}>Film tidak ditemukan</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.95)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #1a1a1a' }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 20, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '0.5px solid #444', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Kembali</button>
      </nav>

      {/* Hero Backdrop */}
      {!playing && (
        <div style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
          {movie.backdropUrl || movie.posterUrl ? (
            <img src={movie.backdropUrl || movie.posterUrl} alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a0a2e, #0f3460)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.97) 35%, rgba(10,10,15,0.4) 70%, transparent), linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 44, left: 32, maxWidth: 520 }}>
            <div style={{ fontSize: 11, color: '#e50914', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>★ FILM</div>
            <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 10, lineHeight: 1.05 }}>{movie.title}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {movie.genre && <span style={{ background: '#e50914', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{movie.genre}</span>}
              <span style={{ color: '#aaa', fontSize: 13 }}>{movie.releaseYear}</span>
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: '#aaa', fontSize: 13 }}>{movie.duration} menit</span>
            </div>
            <p style={{ color: '#bbb', fontSize: 14, lineHeight: 1.65, marginBottom: 20, maxWidth: 460 }}>
              {movie.description?.length > 200 ? movie.description.slice(0, 200) + '...' : movie.description}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {hasVideo ? (
                <button onClick={togglePlay}
                  style={{ background: '#fff', color: '#000', border: 'none', padding: '11px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ▶ Putar Sekarang
                </button>
              ) : (
                <div style={{ background: '#222', border: '0.5px solid #444', color: '#888', padding: '11px 20px', borderRadius: 6, fontSize: 13 }}>
                  Video belum tersedia
                </div>
              )}
              {movie.trailerKey && (
              <button onClick={() => setShowTrailer(!showTrailer)}
                style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '11px 20px', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                🎬 {showTrailer ? 'Tutup Trailer' : 'Tonton Trailer'}
              </button>
            )}
             <WatchlistButton movieId={movie.id} tmdbMovieId={movie.tmdbId} />
            </div>
          </div>
        </div>
      )}

      {/* Video Player — hanya muncul kalau ada video dan sedang play */}
      {hasVideo && (
        <div ref={playerRef} style={{ display: playing ? 'block' : 'none', position: 'relative', background: '#000', width: '100%', aspectRatio: '16/9', maxHeight: '75vh' }}>
          <video ref={videoRef} src={movie.videoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onTimeUpdate={() => videoRef.current && setProgress(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onClick={togglePlay}
          />
          {!playing && (
            <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>▶</div>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '32px 20px 14px' }}>
            <input type="range" min="0" max={duration || 100} value={progress} step="0.1"
              onChange={handleSeek}
              style={{ width: '100%', accentColor: '#e50914', cursor: 'pointer', marginBottom: 10 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: 0 }}>{playing ? '⏸' : '▶'}</button>
                <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted) } }}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 0 }}>{muted ? '🔇' : '🔊'}</button>
                <span style={{ fontSize: 13, color: '#aaa' }}>{formatTime(progress)} / {formatTime(duration)}</span>
                <button onClick={() => { setPlaying(false); videoRef.current?.pause() }}
                  style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 12, cursor: 'pointer', padding: 0 }}>✕ Tutup</button>
              </div>
              <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 0 }}>⛶</button>
            </div>
          </div>
        </div>
      )}

      {movie.trailerKey && showTrailer && (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#e0e0e0' }}>🎬 Trailer Resmi</h3>
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 8, overflow: 'hidden' }}>
          <iframe
            src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
)}

      {/* Info lengkap */}
      <div style={{ padding: '28px 32px', maxWidth: 900 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{movie.title}</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          {movie.genre && <span style={{ background: '#e50914', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{movie.genre}</span>}
          <span style={{ color: '#aaa', fontSize: 13 }}>{movie.releaseYear}</span>
          <span style={{ color: '#555' }}>•</span>
          <span style={{ color: '#aaa', fontSize: 13 }}>{movie.duration} menit</span>
        </div>
        <p style={{ color: '#bbb', fontSize: 15, lineHeight: 1.7 }}>{movie.description}</p>
      </div>

    </div>
  )
}