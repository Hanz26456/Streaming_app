'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'

export default function ContinueWatchingCard({ item }) {
  const { colors, lang } = useApp()
  const router = useRouter()

  // Item can be a watchHistory object
  const isMovie = !!item.movie
  const isEpisode = !!item.episode
  const source = isMovie ? item.movie : (isEpisode ? item.episode : null)
  
  if (!source) return null

  const title = isMovie ? source.title : `${item.series?.title || 'Series'} — S${source.season} E${source.episodeNumber}`
  const poster = isMovie ? source.posterUrl : (source.thumbnailUrl || item.series?.posterUrl)
  const link = isMovie ? `/movie/${source.id}` : `/series/${item.seriesId}/episode/${source.id}`
  const percent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0

  return (
    <motion.div 
      onClick={() => router.push(link)}
      whileHover={{ scale: 1.03, borderColor: '#e50914' }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: 240, flexShrink: 0, cursor: 'pointer', position: 'relative',
        borderRadius: 10, overflow: 'hidden', background: colors.cardBg,
        border: `1px solid ${colors.border}`
      }}
    >
      <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={poster || `https://picsum.photos/seed/cw${item.id}/400/225`} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
          transition: 'opacity 0.2s'
        }} className="hover-play">
          <div style={{ 
            width: 44, height: 44, borderRadius: '50%', background: '#e50914', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' 
          }}>▶</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
        <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: '#e50914' }} />
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ 
          fontSize: 13, fontWeight: 700, color: colors.text, 
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
        }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: colors.textSub, marginTop: 4 }}>
          {lang === 'id' ? 'Lanjutkan Menonton' : 'Continue Watching'}
        </div>
      </div>

      <style jsx>{`
        div:hover .hover-play { opacity: 1; }
      `}</style>
    </motion.div>
  )
}
