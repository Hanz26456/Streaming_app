'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'
import ThemeLangToggle from '@/components/ThemeLangToggle'

export default function SeriesPage() {
  const { colors, lang } = useApp()
  const router = useRouter()
  const [seriesList, setSeriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('Semua')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchSeries()
  }, [genre, year, sort])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (genre !== 'Semua') params.set('genre', genre)
      if (year) params.set('year', year)
      if (sort) params.set('sort', sort)

      const res = await fetch(`/api/series?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setSeriesList(data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: colors.text, fontSize: 16 }}>{lang === 'id' ? 'Memuat series...' : 'Loading series...'}</div>
    </div>
  )

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: colors.bgNav, position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span onClick={() => router.push('/')} style={{ color: colors.textMuted, cursor: 'pointer', fontSize: 14 }}>{lang === 'id' ? 'Beranda' : 'Home'}</span>
            <span onClick={() => router.push('/explore')} style={{ color: colors.textMuted, cursor: 'pointer', fontSize: 14 }}>{lang === 'id' ? 'Eksplorasi' : 'Explore'}</span>
            <span style={{ color: colors.text, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Series</span>
            <span onClick={() => router.push('/movie')} style={{ color: colors.textMuted, cursor: 'pointer', fontSize: 14 }}>{lang === 'id' ? 'Film' : 'Movies'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeLangToggle />
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: `0.5px solid ${colors.borderMuted}`, color: colors.textMuted, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← {lang === 'id' ? 'Beranda' : 'Home'}</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '40px 32px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Series</h1>
            <p style={{ color: colors.textSub, fontSize: 14 }}>{seriesList.length} {lang === 'id' ? 'series tersedia' : 'series available'}</p>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {seriesList.map(series => (
            <div
              key={series.id}
              onClick={() => router.push(`/series/${series.id}`)}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', background: colors.cardBg, transition: 'transform 0.2s', border: `0.5px solid ${colors.border}` }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={series.posterUrl || `https://picsum.photos/seed/${series.id}/300/450`}
                  alt={series.title}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 8, right: 8, background: '#e50914', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  SERIES
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: colors.text }}>{series.title}</div>
                <div style={{ color: colors.textSub, fontSize: 12, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {series.description}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: colors.bgInput, color: colors.textMuted, fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `0.5px solid ${colors.borderMuted}` }}>{series.genre}</span>
                  <span style={{ background: colors.bgInput, color: colors.textMuted, fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `0.5px solid ${colors.borderMuted}` }}>{series._count?.episodes || 0} Episode</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {seriesList.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textSub }}>
            {lang === 'id' ? 'Tidak ada series yang ditemukan dengan kriteria tersebut.' : 'No series found with these criteria.'}
          </div>
        )}
      </div>
    </div>
  )
}