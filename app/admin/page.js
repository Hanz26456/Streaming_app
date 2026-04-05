'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('import')
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
  }, [activeTab])

  const fetchPopular = async (t) => {
    setLoading(true)
    const res = await fetch(`/api/tmdb/search?type=${t}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`)
    const data = await res.json()
    setResults(data)
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
    setMovies(data)
  }

  const fetchSeries = async () => {
    const res = await fetch('/api/admin/series')
    const data = await res.json()
    setSeries(data)
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

  const fetchEpisodes = async (seriesId) => {
    const res = await fetch(`/api/admin/episodes/${seriesId}`)
    const data = await res.json()
    setEpisodes(data)
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

  const inputStyle = { background: '#1e1e1e', border: '1px solid #444', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
  const tabStyle = (t) => ({ background: activeTab === t ? '#e50914' : '#1a1a1a', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 })

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.9)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #1a1a1a' }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
        <div style={{ fontSize: 14, color: '#aaa' }}>⚙️ Panel Admin</div>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '0.5px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Kembali</button>
      </nav>

      <div style={{ padding: '28px 32px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
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

        {/* ─── TAB: IMPORT ─── */}
        {activeTab === 'import' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={type} onChange={e => { setType(e.target.value); fetchPopular(e.target.value) }}
                style={{ background: '#1e1e1e', border: '0.5px solid #444', color: '#fff', padding: '10px 14px', borderRadius: 6, fontSize: 14 }}>
                <option value="movie">Film</option>
                <option value="tv">Series</option>
              </select>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Cari judul film atau series..."
                style={{ flex: 1, minWidth: 200, background: '#1e1e1e', border: '0.5px solid #444', color: '#fff', padding: '10px 14px', borderRadius: 6, fontSize: 14, outline: 'none' }} />
              <button onClick={handleSearch} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cari</button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Memuat data dari TMDB...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {results.map(item => (
                  <div key={item.tmdbId} style={{ background: '#141414', borderRadius: 8, overflow: 'hidden', border: '0.5px solid #2a2a2a' }}>
                    <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{item.releaseYear} • ⭐ {item.rating}</div>
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
              {movies.map(movie => (
                <div key={movie.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#111', borderRadius: 8, padding: '12px 16px', border: '0.5px solid #222' }}>
                  <img src={movie.posterUrl} alt={movie.title} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{movie.title}</div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{movie.releaseYear} • {movie.genre}</div>
                    {movie.videoUrl
                      ? <div style={{ fontSize: 11, color: '#46d369' }}>✅ Video tersedia</div>
                      : <div style={{ fontSize: 11, color: '#e50914' }}>❌ Belum ada video</div>
                    }
                  </div>
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
                <div style={{ background: '#111', borderRadius: 10, padding: 28, width: '90%', maxWidth: 500, border: '0.5px solid #333' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Input Video URL</h3>
                  <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{editingVideo.title}</p>
                  <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>URL Video (Google Drive, Cloudinary, dll)</label>
                  <input value={videoInput} onChange={e => setVideoInput(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: 16 }} />
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>
                    💡 Tips Google Drive: klik kanan file → Bagikan → Salin link. Ubah format URL jadi:<br />
                    <code style={{ color: '#aaa' }}>https://drive.google.com/uc?export=download&id=FILE_ID</code>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveMovieVideo} disabled={saving || !videoInput}
                      style={{ flex: 1, background: '#e50914', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button onClick={() => { setEditingVideo(null); setVideoInput('') }}
                      style={{ flex: 1, background: '#222', color: '#ccc', border: '0.5px solid #444', padding: '10px', borderRadius: 6, cursor: 'pointer' }}>
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
                  {series.map(s => (
                    <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#111', borderRadius: 8, padding: '12px 16px', border: '0.5px solid #222' }}>
                      <img src={s.posterUrl} alt={s.title} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{s.releaseYear} • {s._count?.episodes || 0} Episode</div>
                      </div>
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
                  {episodes.map(ep => (
                    <div key={ep.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#111', borderRadius: 8, padding: '10px 14px', border: '0.5px solid #222' }}>
                      <div style={{ fontSize: 13, color: '#555', minWidth: 60 }}>S{ep.season}E{ep.episodeNumber}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ep.title}</div>
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
                    <div style={{ background: '#111', borderRadius: 10, padding: 28, width: '90%', maxWidth: 500, border: '0.5px solid #333' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Input Video Episode</h3>
                      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>S{editingEp.season}E{editingEp.episodeNumber} — {editingEp.title}</p>
                      <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>URL Video</label>
                      <input value={epVideoInput} onChange={e => setEpVideoInput(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: 16 }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={saveEpisodeVideo} disabled={saving || !epVideoInput}
                          style={{ flex: 1, background: '#e50914', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button onClick={() => { setEditingEp(null); setEpVideoInput('') }}
                          style={{ flex: 1, background: '#222', color: '#ccc', border: '0.5px solid #444', padding: '10px', borderRadius: 6, cursor: 'pointer' }}>
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