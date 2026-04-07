'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function MovieCard({ item, onClick, colors }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div 
      onClick={onClick} 
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      style={{ 
        flexShrink: 0, 
        width: 160, 
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: colors.cardBg }}>
        <img src={item.posterUrl} alt={item.title} style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
        {item.isPremium && (
          <div style={{ 
            position: 'absolute', top: 6, left: 6, 
            background: '#ffd700', color: '#000', 
            fontSize: 9, fontWeight: 800, padding: '2px 6px', 
            borderRadius: 3, display: 'flex', alignItems: 'center', 
            gap: 3, pointerEvents: 'none', zIndex: 2 
          }}>
            👑 PREMIUM
          </div>
        )}
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          height: 3, background: '#e50914', 
          opacity: hover ? 1 : 0, transition: 'opacity 0.2s' 
        }} />
      </div>
      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: colors.text }}>{item.title}</div>
      {item.releaseYear && <div style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>{item.releaseYear}</div>}
      {item.rating && <div style={{ fontSize: 11, color: '#ffd700', marginTop: 2 }}>★ {item.rating}</div>}
    </motion.div>
  )
}
