'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'

export default function AdminPage() {
  const { colors } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('stats')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('movie')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(null)
  const [imported, setImported] = useState([])
  const [message, setMessage] = useState('')

  // Manage tab
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [editingVideo, setEditingVideo] = useState(null) // { id, type, title, videoUrl }
  const [videoInput, setVideoInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Episode manager
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [editingEp, setEditingEp] = useState(null)
  const [epVideoInput, setEpVideoInput] = useState('')

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    fetchPopular('movie')
  }, [])

  useEffect(() => {
    if (activeTab === 'manage-movies') fetchMovies()
    if (activeTab === 'manage-series') fetchSeries()
    if (activeTab === 'stats') fetchStats()
  }, [activeTab])

  const fetchStats = async () => {
    setLoadingStats(true)
    const token = Cookies.get('token')
    const res = await fetch('/api/admin/stats', {
      headers: { authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.error) {
       console.error(data.error)
    } else {
       setStats(data)
    }
    setLoadingStats(false)
  }

  const fetchPopular = async (t) => {
    setLoading(true)
    const res = await fetch(`/api/tmdb/search?type=${t}`)
    const data = await res.json()
    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`)
    const data = await res.json()
    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleImport = async (item) => {
    setImporting(item.tmdbId)
    setMessage('')
    const url = item.type === 'tv' ? '/api/tmdb/import-series' : '/api/tmdb/import-movie'
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: item.tmdbId })
      })
      const data = await res.json()
      setImporting(null)
      if (data.success) {
        setImported(prev => [...prev, item.tmdbId])
        setMessage(`✓ "${item.title}" berhasil diimport!`)
      } else {
        setMessage(`✗ Gagal: ${data.error}`)
      }
    } catch (err) {
      setImporting(null)
      setMessage('✗ Terjadi error saat import')
    }
  }

  const fetchMovies = async () => {
    const res = await fetch('/api/admin/movies')
    const data = await res.json()
    setMovies(Array.isArray(data) ? data : [])
  }

  const fetchSeries = async () => {
    const res = await fetch('/api/admin/series')
    const data = await res.json()
    setSeries(Array.isArray(data) ? data : [])
  }

  const saveMovieVideo = async () => {
    if (!editingVideo) return
    setSaving(true)
    const token = Cookies.get('token')
    await fetch(`/api/movies/${editingVideo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ videoUrl: videoInput })
    })
    setMovies(prev => prev.map(m => m.id === editingVideo.id ? { ...m, videoUrl: videoInput } : m))
    setEditingVideo(null)
    setVideoInput('')
    setSaving(false)
    setMessage('✓ Video URL berhasil disimpan!')
  }

  const togglePremium = async (item, itemType) => {
    const token = Cookies.get('token')
    const url = itemType === 'movie' ? `/api/movies/${item.id}` : `/api/admin/series/${item.id}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ isPremium: !item.isPremium })
    })
    if (res.ok) {
      if (itemType === 'movie') {
        setMovies(prev => prev.map(m => m.id === item.id ? { ...m, isPremium: !item.isPremium } : m))
      } else {
        setSeries(prev => prev.map(s => s.id === item.id ? { ...s, isPremium: !item.isPremium } : s))
      }
      setMessage(`✓ Status Premium "${item.title}" diperbarui!`)
    }
  }

  const fetchEpisodes = async (seriesId) => {
    const res = await fetch(`/api/admin/episodes/${seriesId}`)
    const data = await res.json()
    setEpisodes(Array.isArray(data) ? data : [])
  }

  const saveEpisodeVideo = async () => {
    if (!editingEp) return
    setSaving(true)
    await fetch(`/api/admin/episodes/${selectedSeries.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeId: editingEp.id, videoUrl: epVideoInput })
    })
    setEpisodes(prev => prev.map(e => e.id === editingEp.id ? { ...e, videoUrl: epVideoInput } : e))
    setEditingEp(null)
    setEpVideoInput('')
    setSaving(false)
    setMessage('✓ Video episode berhasil disimpan!')
  }

  const inputStyle = { background: colors.bgInput, border: `1px solid ${colors.borderMuted}`, color: colors.text, padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
  const tabStyle = (t) => ({ background: activeTab === t ? '#e50914' : colors.bgInput, color: colors.text, border: activeTab === t ? 'none' : `1px solid ${colors.borderMuted}`, padding: '9px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 })

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav, position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${colors.border}` }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ fontSize: 14, color: colors.textSub }}>⚙️ Panel Admin</div>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Kembali</button>
      </nav>

      <div style={{ padding: '28px 32px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>📊 Statistik</button>
          <button style={tabStyle('import')} onClick={() => setActiveTab('import')}>🔍 Import dari TMDB</button>
          <button style={tabStyle('manage-movies')} onClick={() => setActiveTab('manage-movies')}>🎬 Kelola Film</button>
          <button style={tabStyle('manage-series')} onClick={() => setActiveTab('manage-series')}>📺 Kelola Series</button>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: message.startsWith('✓') ? '#0d2d0d' : '#2d0d0d', border: `0.5px solid ${message.startsWith('✓') ? '#1a5c1a' : '#5c1a1a'}`, borderRadius: 6, padding: '10px 16px', marginBottom: 20, fontSize: 14, color: message.startsWith('✓') ? '#4caf50' : '#f44336' }}>
            {message}
          </div>
        )}

        {/* ─── TAB: STATS ─── */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {loadingStats || !stats ? (
              <div style={{ textAlign: 'center', padding: 40, color: colors.textSub }}>Memuat statistik...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <StatCard label="Users" value={stats.users || 0} color="#46d369" />
                  <StatCard label="Premium Users" value={stats.premiumUsers || 0} color="#ffd700" />
                  <StatCard label="Movies" value={stats.movies || 0} color="#e50914" />
                  <StatCard label="Series" value={stats.series || 0} color="#0f3460" />
                  <StatCard label="Episodes" value={stats.episodes || 0} color="#ffd700" />
                  <StatCard label="Reviews" value={stats.reviews || 0} color="#ff6b6b" />
                </div>

                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>❤️ Konten Terpopuler (Rating Like)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {stats.mostLiked?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', background: colors.cardBg, padding: 12, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#e50914', width: 24, textAlign: 'center' }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: colors.textSub }}>{item.type?.toUpperCase()} • {item._count?.reviews || 0} Reviews</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#46d369' }}>👍 {item.likes}</div>
                          <div style={{ fontSize: 9, color: colors.textMuted }}>LIKES</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── TAB: IMPORT ─── */}
        {activeTab === 'import' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={type} onChange={e => { setType(e.target.value); fetchPopular(e.target.value) }}
                style={{ background: colors.bgInput, border: `0.5px solid ${colors.borderMuted}`, color: colors.text, padding: '10px 14px', borderRadius: 6, fontSize: 14 }}>
                <option value="movie">Film</option>
                <option value="tv">Series</option>
              </select>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Cari judul film atau series..."
                style={{ flex: 1, minWidth: 200, background: colors.bgInput, border: `0.5px solid ${colors.borderMuted}`, color: colors.text, padding: '10px 14px', borderRadius: 6, fontSize: 14, outline: 'none' }} />
              <button onClick={handleSearch} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cari</button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', color: colors.textSub, padding: 40 }}>Memuat data dari TMDB...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {results?.map(item => (
                  <div key={item.tmdbId} style={{ background: colors.cardBg, borderRadius: 8, overflow: 'hidden', border: `0.5px solid ${colors.border}` }}>
                    <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: colors.text }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 8 }}>{item.releaseYear} • ⭐ {item.rating}</div>
                      <button onClick={() => handleImport(item)} disabled={importing === item.tmdbId || imported.includes(item.tmdbId)}
                        style={{ width: '100%', padding: '7px 0', borderRadius: 5, border: 'none', fontSize: 12, fontWeight: 600, cursor: imported.includes(item.tmdbId) ? 'default' : 'pointer', background: imported.includes(item.tmdbId) ? '#1a3d1a' : importing === item.tmdbId ? '#555' : '#e50914', color: imported.includes(item.tmdbId) ? '#4caf50' : '#fff' }}>
                        {imported.includes(item.tmdbId) ? '✓ Diimport' : importing === item.tmdbId ? 'Mengimport...' : '+ Import'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── TAB: KELOLA FILM ─── */}
        {activeTab === 'manage-movies' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🎬 Film di Database ({movies.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {movies?.map(movie => (
                <div key={movie.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: colors.cardBg, borderRadius: 8, padding: '12px 16px', border: `0.5px solid ${colors.border}` }}>
                  <img src={movie.posterUrl} alt={movie.title} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: colors.text }}>{movie.title}</div>
                    <div style={{ fontSize: 12, color: colors.textSub, marginBottom: 6 }}>{movie.releaseYear} • {movie.genre}</div>
                    {movie.videoUrl
                      ? <div style={{ fontSize: 11, color: '#46d369' }}>✅ Video tersedia</div>
                      : <div style={{ fontSize: 11, color: '#e50914' }}>❌ Belum ada video</div>
                    }
                  </div>
                  <button 
                    onClick={() => togglePremium(movie, 'movie')}
                    style={{ 
                      background: movie.isPremium ? '#ffd700' : 'rgba(255,215,0,0.1)', 
                      color: movie.isPremium ? '#000' : '#ffd700', 
                      border: '1px solid #ffd700', 
                      padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 
                    }}>
                    👑 {movie.isPremium ? 'Premium' : 'Gratis'}
                  </button>
                  <button onClick={() => { setEditingVideo(movie); setVideoInput(movie.videoUrl || '') }}
                    style={{ background: '#1a1a2e', border: '0.5px solid #444', color: '#ccc', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                    {movie.videoUrl ? '✏️ Edit Video' : '+ Tambah Video'}
                  </button>
                </div>
              ))}
            </div>

            {/* Modal edit video film */}
            {editingVideo && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: colors.cardBg, borderRadius: 10, padding: 28, width: '90%', maxWidth: 500, border: `0.5px solid ${colors.border}` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: colors.text }}>Input Video URL</h3>
                  <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>{editingVideo.title}</p>
                  <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 6 }}>URL Video (Google Drive, Cloudinary, dll)</label>
                  <input value={videoInput} onChange={e => setVideoInput(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveMovieVideo} disabled={saving || !videoInput}
                      style={{ flex: 1, background: '#e50914', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button onClick={() => { setEditingVideo(null); setVideoInput('') }}
                      style={{ flex: 1, background: colors.bgInput, color: colors.textMuted, border: `0.5px solid ${colors.borderMuted}`, padding: '10px', borderRadius: 6, cursor: 'pointer' }}>
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: KELOLA SERIES ─── */}
        {activeTab === 'manage-series' && (
          <>
            {!selectedSeries ? (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📺 Series di Database ({series.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {series?.map(s => (
                    <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: colors.cardBg, borderRadius: 8, padding: '12px 16px', border: `0.5px solid ${colors.border}` }}>
                      <img src={s.posterUrl} alt={s.title} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: colors.text }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: colors.textSub }}>{s.releaseYear} • {s._count?.episodes || 0} Episode</div>
                      </div>
                      <button 
                        onClick={() => togglePremium(s, 'series')}
                        style={{ 
                          background: s.isPremium ? '#ffd700' : 'rgba(255,215,0,0.1)', 
                          color: s.isPremium ? '#000' : '#ffd700', 
                          border: '1px solid #ffd700', 
                          padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 
                        }}>
                        👑 {s.isPremium ? 'Premium' : 'Gratis'}
                      </button>
                      <button onClick={() => { setSelectedSeries(s); fetchEpisodes(s.id) }}
                        style={{ background: '#1a1a2e', border: '0.5px solid #444', color: '#ccc', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        📋 Kelola Episode
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <button onClick={() => { setSelectedSeries(null); setEpisodes([]) }}
                    style={{ background: 'transparent', border: '0.5px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Kembali</button>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>Episode — {selectedSeries.title}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {episodes?.map(ep => (
                    <div key={ep.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: colors.cardBg, borderRadius: 8, padding: '10px 14px', border: `0.5px solid ${colors.border}` }}>
                      <div style={{ fontSize: 13, color: colors.textSub, minWidth: 60 }}>S{ep.season}E{ep.episodeNumber}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: colors.text }}>{ep.title}</div>
                        {ep.videoUrl
                          ? <div style={{ fontSize: 11, color: '#46d369' }}>✅ Video tersedia</div>
                          : <div style={{ fontSize: 11, color: '#e50914' }}>❌ Belum ada video</div>
                        }
                      </div>
                      <button onClick={() => { setEditingEp(ep); setEpVideoInput(ep.videoUrl || '') }}
                        style={{ background: '#1a1a2e', border: '0.5px solid #444', color: '#ccc', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>
                        {ep.videoUrl ? '✏️ Edit' : '+ Video'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Modal edit video episode */}
                {editingEp && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: colors.cardBg, borderRadius: 10, padding: 28, width: '90%', maxWidth: 500, border: `0.5px solid ${colors.border}` }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: colors.text }}>Input Video Episode</h3>
                      <p style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>S{editingEp.season}E{editingEp.episodeNumber} — {editingEp.title}</p>
                      <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 6 }}>URL Video</label>
                      <input value={epVideoInput} onChange={e => setEpVideoInput(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: 16 }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={saveEpisodeVideo} disabled={saving || !epVideoInput}
                          style={{ flex: 1, background: '#e50914', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button onClick={() => { setEditingEp(null); setEpVideoInput('') }}
                          style={{ flex: 1, background: colors.bgInput, color: colors.textMuted, border: `0.5px solid ${colors.borderMuted}`, padding: '10px', borderRadius: 6, cursor: 'pointer' }}>
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const { colors } = useApp()
  return (
    <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSub, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: color }}>{value.toLocaleString()}</div>
    </div>
  )
}