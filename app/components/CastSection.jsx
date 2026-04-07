'use client'
import { useApp } from '@/context/AppContext'

export default function CastSection({ cast }) {
  const { colors, lang } = useApp()

  if (!cast || cast.length === 0) return null

  return (
    <div style={{ marginTop: 40, marginBottom: 40 }}>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 800, 
        marginBottom: 20, 
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        👥 {lang === 'id' ? 'Pemain & Kru' : 'Cast & Crew'}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        overflowX: 'auto', 
        paddingBottom: 20,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="hide-scrollbar">
        {cast.map((actor, idx) => (
          <div key={`${actor.id}-${idx}`} style={{ 
            minWidth: 120, 
            maxWidth: 120, 
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              overflow: 'hidden', 
              marginBottom: 10,
              background: '#222',
              border: `2px solid ${colors.border}`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              {actor.profilePath ? (
                <img 
                  src={actor.profilePath} 
                  alt={actor.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 32,
                  color: '#444'
                }}>👤</div>
              )}
            </div>
            <div style={{ 
              fontSize: 13, 
              fontWeight: 700, 
              color: colors.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 2
            }}>
              {actor.name}
            </div>
            <div style={{ 
              fontSize: 11, 
              color: colors.textSub,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {actor.character}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
