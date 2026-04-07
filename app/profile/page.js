'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'
import ThemeLangToggle from '@/components/ThemeLangToggle'
import PaymentModal from '@/components/PaymentModal'

export default function ProfilePage() {
  const { colors, lang } = useApp()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile') // profile | password | history
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }
  const [showPayment, setShowPayment] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const getToken = () => Cookies.get('token')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    fetch('/api/profile', {
      headers: { authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setName(data.name || '')
        setAvatarUrl(data.avatarUrl || '')
        setLoading(false)
      })

    // Fetch history
    setLoadingHistory(true)
    fetch('/api/watch-history', {
      headers: { authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : [])
        setLoadingHistory(false)
      })
      .catch(() => setLoadingHistory(false))
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const token = getToken()
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: form
    })
    const data = await res.json()
    if (res.ok) {
      setAvatarUrl(data.url)
      showMessage('success', 'Foto berhasil diupload!')
    } else {
      showMessage('error', data.error || 'Gagal upload foto')
    }
    setUploading(false)
    e.target.value = ''
  }

  const saveProfile = async () => {
    setSaving(true)
    const token = getToken()
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, avatarUrl })
    })
    const data = await res.json()
    if (res.ok) {
      setProfile(prev => ({ ...prev, ...data }))
      showMessage('success', 'Profil berhasil diperbarui!')
    } else {
      showMessage('error', data.error || 'Gagal update profil')
    }
    setSaving(false)
  }

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Konfirmasi password tidak cocok')
      return
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password minimal 6 karakter')
      return
    }
    setSaving(true)
    const token = getToken()
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword })
    })
    const data = await res.json()
    if (res.ok) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      showMessage('success', 'Password berhasil diubah!')
    } else {
      showMessage('error', data.error || 'Gagal ubah password')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: colors.text, fontSize: 15 }}>{lang === 'id' ? 'Memuat profil...' : 'Loading profile...'}</div>
    </div>
  )

  const inputStyle = {
    width: '100%', background: colors.bgInput, border: `1px solid ${colors.borderMuted}`,
    color: colors.text, padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
  }
  const labelStyle = { fontSize: 12, color: colors.textSub, marginBottom: 7, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', background: colors.bgNav,
        position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${colors.border}`
      }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>
          NUSAFLIX
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span onClick={() => router.push('/')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>{lang === 'id' ? 'Beranda' : 'Home'}</span>
          <span onClick={() => router.push('/watchlist')} style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>❤️ Watchlist</span>
          <ThemeLangToggle />
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header Profil */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 28,
          marginBottom: 36, background: colors.cardBg,
          borderRadius: 16, padding: '28px 32px', border: `1px solid ${colors.border}`,
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative background glow */}
          <div style={{
            position: 'absolute', top: -40, left: -40, width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
              background: '#1a1a2e', border: '3px solid #e50914',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
              boxShadow: '0 0 24px rgba(229,9,20,0.3)'
            }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '👤'
              }
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>{profile?.name}</h1>
              {profile?.isPremium && (
                <span style={{ background: 'linear-gradient(45deg, #ffd700, #ff8c00)', color: '#000', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4, boxShadow: '0 2px 10px rgba(255,215,0,0.3)' }}>
                  👑 PREMIUM
                </span>
              )}
            </div>
            <div style={{ color: colors.textSub, fontSize: 13, marginBottom: 18 }}>{profile?.email}</div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>{profile?._count?.watchlist || 0}</div>
                <div style={{ fontSize: 11, color: colors.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Watchlist</div>
              </div>
              <div style={{ width: 1, height: 32, background: colors.borderMuted }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>{profile?._count?.watchHistory || 0}</div>
                <div style={{ fontSize: 11, color: colors.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{lang === 'id' ? 'Ditonton' : 'Watched'}</div>
              </div>
              <div style={{ width: 1, height: 32, background: colors.borderMuted }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>
                  {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}
                </div>
                <div style={{ fontSize: 11, color: colors.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{lang === 'id' ? 'Bergabung' : 'Joined'}</div>
              </div>
            </div>
          </div>

          {/* Upgrade Banner for Free Users */}
          {!profile?.isPremium && (
            <div style={{
              position: 'absolute', right: 32, top: 28,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              zIndex: 2
            }}>
              <button 
                onClick={() => setShowPayment(true)}
                style={{
                  background: 'linear-gradient(45deg, #ffd700, #ff8c00)',
                  color: '#000', border: 'none', padding: '10px 18px',
                  borderRadius: 10, fontWeight: 800, fontSize: 12,
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                💎 {lang === 'id' ? 'UPGRADE SEKARANG' : 'UPGRADE NOW'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { label: lang === 'id' ? '👤 Edit Profil' : '👤 Edit Profile', value: 'profile' },
            { label: lang === 'id' ? '🔒 Ganti Password' : '🔒 Change Password', value: 'password' },
            { label: lang === 'id' ? '📺 Riwayat Tontonan' : '📺 Watch History', value: 'history' }
          ].map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} style={{
              background: activeTab === tab.value ? '#e50914' : 'transparent',
              color: activeTab === tab.value ? '#fff' : colors.textSub,
              whiteSpace: 'nowrap',
              border: `1px solid ${activeTab === tab.value ? '#e50914' : colors.borderMuted}`,
              padding: '9px 22px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Pesan sukses/error */}
        {message && (
          <div style={{
            background: message.type === 'success' ? 'rgba(70,211,105,0.08)' : 'rgba(229,9,20,0.08)',
            border: `1px solid ${message.type === 'success' ? '#46d369' : '#e50914'}`,
            color: message.type === 'success' ? '#46d369' : '#ff6b6b',
            padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span>{message.type === 'success' ? '✅' : '❌'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div style={{
            background: colors.cardBg,
            borderRadius: 12, padding: 32, border: `1px solid ${colors.border}`,
            display: 'flex', flexDirection: 'column', gap: 24
          }}>
            {/* Upload Foto */}
            <div>
              <label style={labelStyle}>{lang === 'id' ? 'Foto Profil' : 'Profile Photo'}</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: colors.bgInput, borderRadius: 10, padding: '16px 20px',
                border: `1px dashed ${colors.borderMuted}`
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: '50%', overflow: 'hidden',
                  background: colors.bg, border: `3px solid ${colors.borderMuted}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, flexShrink: 0, position: 'relative'
                }}>
                  {uploading ? <div style={{ fontSize: 20 }}>⏳</div> : avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="avatar-upload" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: uploading ? colors.bg : colors.bgInput,
                    border: `1px solid ${colors.borderMuted}`,
                    color: uploading ? colors.textSub : colors.textMuted,
                    padding: '9px 18px', borderRadius: 8,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s', userSelect: 'none'
                  }}>
                    <span>{uploading ? '⏳' : '📷'}</span>
                    <span>{uploading ? (lang === 'id' ? 'Mengupload...' : 'Uploading...') : (lang === 'id' ? 'Pilih Foto' : 'Select Photo')}</span>
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleAvatarUpload} />
                  <div style={{ fontSize: 11, color: colors.textSub, marginTop: 8, lineHeight: 1.6 }}>Format: JPG, PNG, WEBP, GIF<br />{lang === 'id' ? 'Ukuran maksimal: 2MB' : 'Max size: 2MB'}</div>
                </div>
                {avatarUrl && !uploading && (
                  <button onClick={() => setAvatarUrl('')} style={{ background: 'transparent', border: '1px solid #3a1a1a', color: '#e50914', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑️ Hapus</button>
                )}
              </div>
            </div>

            {/* Nama */}
            <div>
              <label style={labelStyle}>{lang === 'id' ? 'Nama' : 'Name'}</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder={lang === 'id' ? 'Nama kamu' : 'Your name'} />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input value={profile?.email || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>

            <button onClick={saveProfile} disabled={saving} style={{ background: saving ? '#8b0000' : '#e50914', color: '#fff', border: 'none', padding: '13px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}>
              {saving ? (lang === 'id' ? 'Menyimpan...' : 'Saving...') : (lang === 'id' ? 'Simpan Perubahan' : 'Save Changes')}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div style={{ background: colors.cardBg, borderRadius: 12, padding: 32, border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={labelStyle}>{lang === 'id' ? 'Password Lama' : 'Old Password'}</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'id' ? 'Password Baru' : 'New Password'}</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'id' ? 'Konfirmasi Password Baru' : 'Confirm New Password'}</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
            </div>
            <button onClick={savePassword} disabled={saving || newPassword !== confirmPassword || newPassword.length < 6} style={{ background: (saving || newPassword !== confirmPassword || newPassword.length < 6) ? colors.borderMuted : '#e50914', color: '#fff', border: 'none', padding: '13px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              {saving ? (lang === 'id' ? 'Menyimpan...' : 'Saving...') : (lang === 'id' ? 'Ubah Password' : 'Change Password')}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSub }}>{lang === 'id' ? 'Memuat riwayat...' : 'Loading history...'}</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: colors.cardBg, borderRadius: 12, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📺</div>
                <div style={{ color: colors.text, fontWeight: 600, marginBottom: 8 }}>{lang === 'id' ? 'Belum Ada Riwayat' : 'No History Yet'}</div>
                <button onClick={() => router.push('/')} style={{ marginTop: 20, background: '#e50914', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{lang === 'id' ? 'Mulai Menonton' : 'Start Watching'}</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {history.map(item => {
                  const isMovie = !!item.movie
                  const title = isMovie ? item.movie.title : `${item.episode.series.title} S${item.episode.season} E${item.episode.episodeNumber}`
                  const poster = isMovie ? item.movie.posterUrl : (item.episode.thumbnailUrl || item.episode.series.posterUrl)
                  const link = isMovie ? `/movie/${item.movie.id}` : `/series/${item.seriesId}/episode/${item.episodeId}`
                  const percent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0
                  return (
                    <div key={item.id} onClick={() => router.push(link)} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                        <img src={poster} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
                          <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: '#e50914' }} />
                        </div>
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                        <div style={{ fontSize: 11, color: colors.textSub }}>{new Date(item.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

    </div>
    </div>
  )
}