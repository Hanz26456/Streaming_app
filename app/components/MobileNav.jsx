'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function MobileNav() {
  const router = useRouter()
  const path = usePathname()

  const items = [
    { icon: '🏠', label: 'Beranda', href: '/' },
    { icon: '🎬', label: 'Film', href: '/movies' },
    { icon: '📺', label: 'Series', href: '/series' },
    { icon: '🔍', label: 'Cari', href: '/search' },
    { icon: '❤️', label: 'Watchlist', href: '/watchlist' },
  ]

  return (
    <>
      {/* Hanya tampil di mobile */}
      <style>{`
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          .desktop-nav-links { display: none !important; }
        }
      `}</style>
      <div className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.97)', borderTop: '0.5px solid #222',
        display: 'none', justifyContent: 'space-around', padding: '10px 0 16px'
      }}>
        {items.map(item => (
          <div key={item.href} onClick={() => router.push(item.href)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: path === item.href ? 1 : 0.5, transition: 'opacity 0.2s' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: path === item.href ? '#e50914' : '#aaa', fontWeight: path === item.href ? 700 : 400 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}