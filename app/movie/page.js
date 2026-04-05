'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function MoviesPage() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    fetchMovies(1)
  }, [])

  const fetchMovies = async (p) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?language=id-ID&page=${p}`,
        { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` } }
      )
      const data = await res.json()
      const mapped = data.results.map(m => ({
        id: m.id,
        title: m.title,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        releaseYear: m.release_date ? m.release_date.split('-')[0] : '',
        rating: m.vote_average?.toFixed(1),
      }))
      setMovies(prev => p === 1 ? mapped : [...prev, ...mapped])
      setPage(p)
    } catch (e) {
      console.error(e)
    }
    if (p === 1) setLoading(false); else setLoadingMore(false)
  }

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff' }}>Memuat film...</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.95)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span onClick={() => router.push('/')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Beranda</span>
            <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Series</span>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Film</span>
          </div>
        </div>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '0.5px solid #444', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Beranda</button>
      </nav>

      <div style={{ padding: '32px 32px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Film</h1>
          <p style={{ color: '#888', fontSize: 14 }}>{movies.length} film tersedia</p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          {movies.map(movie => (
            <div key={movie.id} onClick={() => router.push(`/movie/${movie.id}`)}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', background: '#1a1a1a', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ position: 'relative' }}>
                <img src={movie.posterUrl} alt={movie.title}
                  style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
                {movie.rating && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.75)', color: '#ffd700', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                    ★ {movie.rating}
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 3 }}>{movie.title}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{movie.releaseYear}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => fetchMovies(page + 1)} disabled={loadingMore}
            style={{ background: '#e50914', color: '#fff', border: 'none', padding: '12px 40px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: loadingMore ? 0.6 : 1 }}>
            {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      </div>
    </div>
  )
}