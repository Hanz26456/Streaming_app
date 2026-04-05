'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AdminPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('movie')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(null)
  const [imported, setImported] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPopular('movie')
  }, [])

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

    const url = item.type === 'tv'
      ? '/api/tmdb/import-series'
      : '/api/tmdb/import-movie'

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

        const info = item.type === 'tv'
          ? `✓ "${item.title}" diimport — ${data.totalEpisodes} episode!`
          : `✓ "${item.title}" berhasil diimport!`

        setMessage(info)
      } else {
        setMessage(`✗ Gagal: ${data.error}`)
      }
    } catch (err) {
      setImporting(null)
      setMessage('✗ Terjadi error saat import')
      console.error(err)
    }
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(0,0,0,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div
          onClick={() => router.push('/')}
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#e50914',
            letterSpacing: 3,
            cursor: 'pointer'
          }}>
          NUSAFLIX
        </div>

        <div style={{ fontSize: 14, color: '#aaa' }}>
          Panel Admin — Import Film
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: '0.5px solid #555',
            color: '#ccc',
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13
          }}>
          ← Kembali
        </button>
      </nav>

      <div style={{ padding: '28px 32px' }}>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <select
            value={type}
            onChange={e => {
              setType(e.target.value)
              fetchPopular(e.target.value)
            }}
            style={{
              background: '#1e1e1e',
              border: '0.5px solid #444',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 14
            }}>
            <option value="movie">Film</option>
            <option value="tv">Series</option>
          </select>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Cari judul film atau series..."
            style={{
              flex: 1,
              minWidth: 200,
              background: '#1e1e1e',
              border: '0.5px solid #444',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none'
            }}
          />

          <button
            onClick={handleSearch}
            style={{
              background: '#e50914',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}>
            Cari
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: message.startsWith('✓') ? '#0d2d0d' : '#2d0d0d',
            border: `0.5px solid ${message.startsWith('✓') ? '#1a5c1a' : '#5c1a1a'}`,
            borderRadius: 6,
            padding: '10px 16px',
            marginBottom: 16,
            fontSize: 14,
            color: message.startsWith('✓') ? '#4caf50' : '#f44336'
          }}>
            {message}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
            Memuat data dari TMDB...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16
          }}>
            {results.map(item => (
              <div
                key={item.tmdbId}
                style={{
                  background: '#141414',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '0.5px solid #2a2a2a'
                }}>

                <img
                  src={item.posterUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover'
                  }}
                />

                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                    {item.releaseYear} • ⭐ {item.rating}
                  </div>

                  <button
                    onClick={() => handleImport(item)}
                    disabled={importing === item.tmdbId || imported.includes(item.tmdbId)}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: imported.includes(item.tmdbId) ? 'default' : 'pointer',
                      background: imported.includes(item.tmdbId)
                        ? '#1a3d1a'
                        : importing === item.tmdbId
                          ? '#555'
                          : '#e50914',
                      color: imported.includes(item.tmdbId) ? '#4caf50' : '#fff'
                    }}>
                    {imported.includes(item.tmdbId)
                      ? '✓ Diimport'
                      : importing === item.tmdbId
                        ? 'Mengimport...'
                        : '+ Import'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}