'use client'
import { useApp } from '@/context/AppContext'

export default function PremiumGate({ onUpgrade }) {
  const { colors, lang } = useApp()

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 32,
      textAlign: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>👑</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#fff' }}>
        {lang === 'id' ? 'Konten Khusus Member Premium' : 'Premium Member Exclusive'}
      </h2>
      <p style={{ color: '#aaa', fontSize: 15, maxWidth: 400, marginBottom: 28, lineHeight: 1.6 }}>
        {lang === 'id' 
          ? 'Nikmati akses tak terbatas ke seluruh film dan series eksklusif dengan berlangganan Nusaflix Premium.' 
          : 'Enjoy unlimited access to all exclusive movies and series by subscribing to Nusaflix Premium.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button 
          onClick={onUpgrade}
          style={{ 
            background: '#e50914', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 32px', 
            borderRadius: 6, 
            fontSize: 15, 
            fontWeight: 700, 
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(229,9,20,0.39)'
          }}
        >
          {lang === 'id' ? 'Berlangganan Sekarang' : 'Subscribe Now'}
        </button>
      </div>
    </div>
  )
}
