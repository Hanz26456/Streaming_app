'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function WatchlistButton({ movieId, seriesId, tmdbMovieId, tmdbSeriesId }) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Cek status watchlist saat mount
    const token = Cookies.get('token')
    if (!token) return
    fetch('/api/watchlist', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const found = data.some(w =>
          (movieId && w.movieId === movieId) ||
          (seriesId && w.seriesId === seriesId)
        )
        setInWatchlist(found)
      })
  }, [movieId, seriesId])

  const toggle = async () => {
    const token = Cookies.get('token')
    if (!token) return
    setLoading(true)

    if (inWatchlist) {
      // Hapus
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId, seriesId })
      })
      setInWatchlist(false)
    } else {
      // Tambah — kirim tmdbId kalau ada, fallback ke DB id
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tmdbMovieId: tmdbMovieId || null,
          tmdbSeriesId: tmdbSeriesId || null,
          movieId: !tmdbMovieId ? movieId : null,
          seriesId: !tmdbSeriesId ? seriesId : null,
        })
      })
      setInWatchlist(true)
    }
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      style={{
        background: inWatchlist ? '#e50914' : 'rgba(109,109,110,0.7)',
        color: '#fff', border: 'none', padding: '11px 20px',
        borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 600,
        opacity: loading ? 0.6 : 1, transition: 'background 0.2s'
      }}>
      {loading ? '...' : inWatchlist ? '❤️ Di Watchlist' : '+ Watchlist'}
    </button>
  )
}