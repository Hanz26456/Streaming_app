'use client'

export default function MovieSection({ title, children, colors }) {
  if (!children || children.length === 0) return null
  
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>{title}</div>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        overflowX: 'auto', 
        paddingBottom: 20,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="hide-scrollbar">
        {children}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
