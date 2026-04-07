'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import Cookies from 'js-cookie'

export default function PaymentModal({ isOpen, onClose }) {
  const { colors, lang } = useApp()
  const [step, setStep] = useState(1) // 1: Plans, 2: Success
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handlePayMidtrans = async () => {
    setLoading(true)
    const token = Cookies.get('token')
    
    try {
      // 1. Get Snap Token from our API
      const res = await fetch('/api/payment/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          plan: 'Monthly Premium', 
          amount: 49000 
        })
      })
      
      const data = await res.json()
      
      if (data.token) {
        // 2. Open Midtrans Snap Popup
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log('Payment success:', result)
            setStep(2) // Show success screen
          },
          onPending: (result) => {
            console.log('Payment pending:', result)
            alert(lang === 'id' ? 'Pembayaran tertunda. Silakan selesaikan pembayaran Anda.' : 'Payment pending. Please complete your payment.')
          },
          onError: (result) => {
            console.error('Payment error:', result)
            alert(lang === 'id' ? 'Terjadi kesalahan saat pembayaran.' : 'An error occurred during payment.')
          },
          onClose: () => {
            console.log('User closed the popup')
          }
        })
      } else {
        alert(data.error || 'Gagal memulai pembayaran')
      }
    } catch (err) {
      console.error('Payment Modal Error:', err)
      alert('Internal Server Error')
    } finally {
      setLoading(false)
    }
  }

  const modalStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    padding: 20
  }

  const cardStyle = {
    background: colors.cardBg,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={modalStyle}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={cardStyle}
          >
            
            {/* Header */}
            <div style={{ padding: '24px 32px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#e50914' }}>
                👑  {lang === 'id' ? 'Nusaflix Premium' : 'Nusaflix Premium'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 32 }}>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
                    {lang === 'id' ? 'Pilih Paket Anda' : 'Choose Your Plan'}
                  </h3>
                  <div style={{ background: 'rgba(229,9,20,0.1)', border: '2px solid #e50914', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>Monthly Plan</span>
                      <span style={{ color: '#e50914', fontWeight: 800, fontSize: 20 }}>Rp 49.000</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: colors.textSub, lineHeight: 1.8 }}>
                      <li>{lang === 'id' ? 'Akses ke semua Konten Premium' : 'Access to all Premium Content'}</li>
                      <li>{lang === 'id' ? 'Kualitas Ultra HD (4K)' : 'Ultra HD (4K) Quality'}</li>
                      <li>{lang === 'id' ? 'Tonton di semua perangkat' : 'Watch on all devices'}</li>
                      <li>{lang === 'id' ? 'Bebas Iklan selamanya' : 'Ad-free experience'}</li>
                    </ul>
                  </div>

                  <div style={{ padding: '16px', background: colors.bgInput, borderRadius: 12, marginBottom: 24, border: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ fontSize: 20 }}>💳</div>
                       <div style={{ fontSize: 13, color: colors.textSub }}>
                         {lang === 'id' ? 'Pembayaran Aman via Midtrans' : 'Secure Payment via Midtrans'}
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handlePayMidtrans}
                    disabled={loading}
                    style={{ 
                       width: '100%', padding: '16px', background: '#e50914', color: '#fff', 
                       border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, 
                       cursor: 'pointer', opacity: loading ? 0.7 : 1 
                    }}>
                    {loading ? (lang === 'id' ? 'Memproses...' : 'Processing...') : (lang === 'id' ? 'Bayar Sekarang' : 'Pay Now')}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: 64, marginBottom: 20 }}>🎯</div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
                    {lang === 'id' ? 'Pembayaran Selesai!' : 'Payment Completed!'}
                  </h3>
                  <p style={{ color: colors.textSub, marginBottom: 28 }}>
                    {lang === 'id' 
                      ? 'Selamat! Akun Anda kini sudah menjadi Member Premium. Nikmati akses tanpa batas ke seluruh konten kami.' 
                      : 'Congratulations! Your account is now a Premium Member. Enjoy unlimited access to all our content.'}
                  </p>
                  <button 
                    onClick={() => { onClose(); window.location.reload() }}
                    style={{ width: '100%', padding: '16px', background: '#46d369', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                    {lang === 'id' ? 'Mulai Menonton' : 'Start Watching'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
