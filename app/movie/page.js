'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'
import ThemeLangToggle from '@/components/ThemeLangToggle'

export default function MoviesPage() {
  const { colors, lang } = useApp()
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('Semua')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchMovies()
  }, [genre, year, sort])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (genre !== 'Semua') params.set('genre', genre)
      if (year) params.set('year', year)
      if (sort) params.set('sort', sort)

      const res = await fetch(`/api/movies?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setMovies(data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: colors.text }}>{lang === 'id' ? 'Memuat film...' : 'Loading movies...'}</div>
    </div>
  )

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav, position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span onClick={() => router.push('/')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>{lang === 'id' ? 'Beranda' : 'Home'}</span>
            <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>Series</span>
            <span style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>{lang === 'id' ? 'Film' : 'Movies'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeLangToggle />
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← {lang === 'id' ? 'Beranda' : 'Home'}</button>
        </div>
      </nav>

      <div style={{ padding: '32px 32px' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{lang === 'id' ? 'Film' : 'Movies'}</h1>
            <p style={{ color: colors.textSub, fontSize: 14 }}>{movies.length} {lang === 'id' ? 'film tersedia' : 'movies available'}</p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Genre Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: colors.textSub, fontWeight: 700 }}>GENRE</label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                style={{ background: colors.bgInput, color: colors.text, border: `1px solid ${colors.borderMuted}`, padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                {['Semua', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: colors.textSub, fontWeight: 700 }}>{lang === 'id' ? 'TAHUN' : 'YEAR'}</label>
              <input 
                type="number" 
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: 80, background: colors.bgInput, color: colors.text, border: `1px solid ${colors.borderMuted}`, padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
            </div>

            {/* Sort Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: colors.textSub, fontWeight: 700 }}>{lang === 'id' ? 'URUTKAN' : 'SORT BY'}</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                style={{ background: colors.bgInput, color: colors.text, border: `1px solid ${colors.borderMuted}`, padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }}
              >
                <option value="newest">{lang === 'id' ? 'Terbaru' : 'Newest'}</option>
                <option value="oldest">{lang === 'id' ? 'Terlama' : 'Oldest'}</option>
                <option value="title">A-Z</option>
                <option value="popular">{lang === 'id' ? 'Populer' : 'Popular'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          {movies.map(movie => (
            <div key={movie.id} onClick={() => router.push(`/movie/${movie.id}`)}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', background: colors.cardBg, transition: 'transform 0.2s', border: `0.5px solid ${colors.border}` }}
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
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 3 }}>{movie.title}</div>
                <div style={{ fontSize: 11, color: colors.textSub }}>{movie.releaseYear}</div>
              </div>
            </div>
          ))}
        </div>

        {movies.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textSub }}>
            {lang === 'id' ? 'Tidak ada film yang ditemukan dengan kriteria tersebut.' : 'No movies found with these criteria.'}
          </div>
        )}
      </div>
    </div>
  )
}