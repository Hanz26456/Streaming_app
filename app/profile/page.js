'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile') // profile | password
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

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
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 15 }}>Memuat profil...</div>
    </div>
  )

  const inputStyle = {
    width: '100%', background: '#1a1a2e', border: '1px solid #2a2a3e',
    color: '#fff', padding: '11px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
  }
  const labelStyle = { fontSize: 12, color: '#888', marginBottom: 7, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', background: 'rgba(0,0,0,0.97)',
        position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #1a1a1a'
      }}>
        <div onClick={() => router.push('/')} style={{ fontSize: 22, fontWeight: 700, color: '#e50914', letterSpacing: 3, cursor: 'pointer' }}>
          NUSAFLIX
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span onClick={() => router.push('/')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>Beranda</span>
          <span onClick={() => router.push('/watchlist')} style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}>❤️ Watchlist</span>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header Profil */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 28,
          marginBottom: 36, background: 'linear-gradient(135deg, #141420 0%, #111 100%)',
          borderRadius: 16, padding: '28px 32px', border: '1px solid #1e1e2e',
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
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: 0.5 }}>{profile?.name}</h1>
            <div style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>{profile?.email}</div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>{profile?._count?.watchlist || 0}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Watchlist</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#222' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>{profile?._count?.watchHistory || 0}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Ditonton</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#222' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e50914', lineHeight: 1 }}>
                  {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bergabung</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[{ label: '👤 Edit Profil', value: 'profile' }, { label: '🔒 Ganti Password', value: 'password' }].map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} style={{
              background: activeTab === tab.value ? '#e50914' : 'transparent',
              color: activeTab === tab.value ? '#fff' : '#888',
              border: `1px solid ${activeTab === tab.value ? '#e50914' : '#2a2a2a'}`,
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

        {/* Tab: Edit Profil */}
        {activeTab === 'profile' && (
          <div style={{
            background: 'linear-gradient(180deg, #111 0%, #0e0e18 100%)',
            borderRadius: 12, padding: 32, border: '1px solid #1e1e2e',
            display: 'flex', flexDirection: 'column', gap: 24
          }}>

            {/* Upload Foto */}
            <div>
              <label style={labelStyle}>Foto Profil</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: '#0d0d1a', borderRadius: 10, padding: '16px 20px',
                border: '1px dashed #2a2a3e'
              }}>
                {/* Preview */}
                <div style={{
                  width: 76, height: 76, borderRadius: '50%', overflow: 'hidden',
                  background: '#1a1a2e', border: '3px solid #2a2a3e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, flexShrink: 0, position: 'relative'
                }}>
                  {uploading ? (
                    <div style={{ fontSize: 20 }}>⏳</div>
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '👤'}
                </div>

                {/* Tombol & info */}
                <div style={{ flex: 1 }}>
                  <label htmlFor="avatar-upload" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: uploading ? '#1a1a2e' : '#1e1e30',
                    border: '1px solid #3a3a5e',
                    color: uploading ? '#666' : '#ccc',
                    padding: '9px 18px', borderRadius: 8,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s', userSelect: 'none'
                  }}>
                    <span>{uploading ? '⏳' : '📷'}</span>
                    <span>{uploading ? 'Mengupload...' : 'Pilih Foto'}</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    disabled={uploading}
                    onChange={handleAvatarUpload}
                  />
                  <div style={{ fontSize: 11, color: '#555', marginTop: 8, lineHeight: 1.6 }}>
                    Format: JPG, PNG, WEBP, GIF<br />
                    Ukuran maksimal: 2MB
                  </div>
                </div>

                {/* Hapus foto */}
                {avatarUrl && !uploading && (
                  <button onClick={() => setAvatarUrl('')} style={{
                    background: 'transparent', border: '1px solid #3a1a1a',
                    color: '#e50914', padding: '7px 12px', borderRadius: 6,
                    cursor: 'pointer', fontSize: 12, flexShrink: 0
                  }} title="Hapus foto">
                    🗑️ Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                placeholder="Nama kamu"
                onFocus={e => e.target.style.borderColor = '#e50914'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={profile?.email || ''}
                disabled
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
              />
              <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>Email tidak dapat diubah</div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                background: saving ? '#8b0000' : '#e50914',
                color: '#fff', border: 'none', padding: '13px',
                borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
                transition: 'background 0.2s'
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}

        {/* Tab: Ganti Password */}
        {activeTab === 'password' && (
          <div style={{
            background: 'linear-gradient(180deg, #111 0%, #0e0e18 100%)',
            borderRadius: 12, padding: 32, border: '1px solid #1e1e2e',
            display: 'flex', flexDirection: 'column', gap: 24
          }}>
            <div>
              <label style={labelStyle}>Password Lama</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#e50914'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
              />
            </div>
            <div>
              <label style={labelStyle}>Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#e50914'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
              />
              {newPassword.length > 0 && newPassword.length < 6 && (
                <div style={{ fontSize: 11, color: '#e50914', marginTop: 5 }}>⚠️ Minimal 6 karakter</div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword.length > 0
                    ? (confirmPassword === newPassword ? '#46d369' : '#e50914')
                    : '#2a2a3e'
                }}
                placeholder="••••••••"
              />
              {confirmPassword.length > 0 && (
                <div style={{ fontSize: 11, marginTop: 5, color: confirmPassword === newPassword ? '#46d369' : '#e50914' }}>
                  {confirmPassword === newPassword ? '✅ Password cocok' : '❌ Password tidak cocok'}
                </div>
              )}
            </div>

            <button
              onClick={savePassword}
              disabled={saving || newPassword !== confirmPassword || newPassword.length < 6}
              style={{
                background: (saving || newPassword !== confirmPassword || newPassword.length < 6) ? '#3a3a3a' : '#e50914',
                color: '#fff', border: 'none', padding: '13px',
                borderRadius: 8,
                cursor: (saving || newPassword !== confirmPassword || newPassword.length < 6) ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
                transition: 'background 0.2s'
              }}
            >
              {saving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}