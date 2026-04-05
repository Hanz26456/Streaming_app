'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [genre, setGenre] = useState('Semua')
  const [type, setType] = useState('all')
  const [results, setResults] = useState({ movies: [], series: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [allContent, setAllContent] = useState({ movies: [], series: [] })

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    // Load semua konten untuk tampilan awal
    Promise.all([
      fetch('/api/movies').then(r => r.json()),
      fetch('/api/series').then(r => r.json())
    ]).then(([movies, series]) => {
      setAllContent({ movies: Array.isArray(movies) ? movies : [], series: Array.isArray(series) ? series : [] })
    })

    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q, 'Semua', 'all') }
  }, [])

  const doSearch = useCallback((q, g, t) => {
    setLoading(true)
    setSearched(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (g && g !== 'Semua') params.set('genre', g)
    if (t !== 'all') params.set('type', t)
    fetch(`/api/search?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false) })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) doSearch(query, genre, type)
  }

  const handleGenreChange = (g) => {
    setGenre(g)
    if (searched) doSearch(query, g, type)
  }

  const handleTypeChange = (t) => {
    setType(t)
    if (searched) doSearch(query, genre, t)
  }

  // Ambil genres unik dari semua konten
  const allGenres = ['Semua', ...new Set([
    ...allContent.movies.map(m => m.genre?.split(',')[0]?.trim()).filter(Boolean),
    ...allContent.series.map(s => s.genre?.split(',')[0]?.trim()).filter(Boolean)
  ])]

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(0,0,0,0.95)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>NUSAFLIX</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span onClick={() => router.push('/')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Beranda</span>
            <span onClick={() => router.push('/series')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Series</span>
            <span onClick={() => router.push('/movies')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Film</span>
          </div>
        </div>
      </nav>

      <div style={{ padding: '36px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#666' }}>🔍</span>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul film atau series..."
                style={{ width: '100%', padding: '13px 18px 13px 44px', borderRadius: 8, background: '#141414', border: '0.5px solid #2a2a2a', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#e50914'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
            <button type="submit"
              style={{ background: '#e50914', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Cari
            </button>
          </div>
        </form>

        {/* Filter Type */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[{ label: 'Semua', value: 'all' }, { label: 'Film', value: 'movie' }, { label: 'Series', value: 'series' }].map(t => (
            <button key={t.value} onClick={() => handleTypeChange(t.value)}
              style={{ background: type === t.value ? '#e50914' : '#141414', color: '#fff', border: type === t.value ? 'none' : '0.5px solid #2a2a2a', padding: '7px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: type === t.value ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter Genre */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {allGenres.slice(0, 12).map(g => (
            <button key={g} onClick={() => handleGenreChange(g)}
              style={{ background: genre === g ? '#fff' : 'transparent', color: genre === g ? '#000' : '#888', border: '0.5px solid', borderColor: genre === g ? '#fff' : '#333', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: genre === g ? 600 : 400, transition: 'all 0.15s' }}>
              {g}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#555', padding: '60px 0' }}>
            <div style={{ fontSize: 14 }}>Mencari...</div>
          </div>
        )}

        {/* Hasil pencarian */}
        {!loading && searched && (
          <>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
              {results.total} hasil untuk
              <span style={{ color: '#fff', fontWeight: 600 }}> "{query}"</span>
            </div>

            {results.movies?.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e0e0e0' }}>
                  Film <span style={{ color: '#555', fontWeight: 400, fontSize: 13 }}>— {results.movies.length} hasil</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                  {results.movies.map(movie => (
                    <ContentCard key={movie.id} item={movie} type="movie" onClick={() => router.push(`/movie/${movie.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {results.series?.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e0e0e0' }}>
                  Series <span style={{ color: '#555', fontWeight: 400, fontSize: 13 }}>— {results.series.length} hasil</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                  {results.series.map(s => (
                    <ContentCard key={s.id} item={s} type="series" onClick={() => router.push(`/series/${s.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
                <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.4 }}>🎬</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#666' }}>Tidak ditemukan</div>
                <div style={{ fontSize: 13, color: '#444' }}>Coba kata kunci atau filter lain</div>
              </div>
            )}
          </>
        )}

        {/* Tampilan awal — belum search */}
        {!searched && !loading && (
          <>
            {allContent.movies.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e0e0e0' }}>Film Tersedia</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                  {allContent.movies.map(movie => (
                    <ContentCard key={movie.id} item={movie} type="movie" onClick={() => router.push(`/movie/${movie.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {allContent.series.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e0e0e0' }}>Series Tersedia</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                  {allContent.series.map(s => (
                    <ContentCard key={s.id} item={s} type="series" onClick={() => router.push(`/series/${s.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {allContent.movies.length === 0 && allContent.series.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
                <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.4 }}>🔍</div>
                <div style={{ fontSize: 14, color: '#555' }}>Ketik judul untuk mulai mencari</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ContentCard({ item, type, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', background: '#0f0f0f', border: '0.5px solid', borderColor: hover ? '#333' : '#1a1a1a', transform: hover ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.2s' }}>
      <div style={{ position: 'relative' }}>
        <img src={item.posterUrl || `https://picsum.photos/seed/${item.id}x/300/450`} alt={item.title}
          style={{ width: '100%', height: 215, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 7, right: 7, background: type === 'series' ? '#e50914' : 'rgba(0,0,0,0.7)', border: type === 'series' ? 'none' : '0.5px solid #444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3 }}>
          {type === 'series' ? 'SERIES' : 'FILM'}
        </div>
        {hover && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>▶</div>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#e0e0e0', marginBottom: 4, lineHeight: 1.3 }}>
          {item.title?.length > 24 ? item.title.slice(0, 24) + '...' : item.title}
        </div>
        <div style={{ fontSize: 11, color: '#666' }}>
          {item.releaseYear}
          {item._count?.episodes && <span> · {item._count.episodes} ep</span>}
          {item.duration && <span> · {item.duration} mnt</span>}
        </div>
        {item.genre && (
          <div style={{ fontSize: 10, color: '#e50914', marginTop: 4, fontWeight: 500 }}>
            {item.genre.split(',')[0].trim()}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Memuat...
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}