'use client'

export function SkeletonCard() {
  return (
    <div style={{ flexShrink: 0, width: 160 }}>
      <div style={{ width: '100%', height: 230, borderRadius: 6, background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ marginTop: 8, height: 14, width: '80%', borderRadius: 4, background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ marginTop: 6, height: 11, width: '50%', borderRadius: 4, background: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div style={{ height: 480, background: 'linear-gradient(90deg, #111 25%, #1a1a2e 50%, #111 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', display: 'flex', alignItems: 'flex-end', padding: '0 48px 48px' }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ height: 12, width: 140, borderRadius: 4, background: '#252540', marginBottom: 16 }} />
        <div style={{ height: 52, width: 320, borderRadius: 6, background: '#252540', marginBottom: 14 }} />
        <div style={{ height: 14, width: 200, borderRadius: 4, background: '#252540', marginBottom: 16 }} />
        <div style={{ height: 14, width: '90%', borderRadius: 4, background: '#252540', marginBottom: 8 }} />
        <div style={{ height: 14, width: '70%', borderRadius: 4, background: '#252540', marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ height: 44, width: 120, borderRadius: 6, background: '#252540' }} />
          <div style={{ height: 44, width: 100, borderRadius: 6, background: '#252540' }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonSection() {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ height: 18, width: 160, borderRadius: 4, background: '#1a1a2e', marginBottom: 14, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)' }} />
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
        {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}

// Inject keyframes sekali
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`
  document.head.appendChild(style)
}