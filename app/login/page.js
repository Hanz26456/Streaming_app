'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Terjadi kesalahan')
      return
    }

    Cookies.set('token', data.token, { expires: 7 })
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#141414', border: '0.5px solid #2a2a2a',
        borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 400
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700,
            color: '#e50914', letterSpacing: 3, marginBottom: 6
          }}>NUSAFLIX</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
            {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
          </div>
        </div>

        {mode === 'register' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama kamu"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 6,
                background: '#1e1e1e', border: '0.5px solid #333',
                color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            placeholder="email@kamu.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 6,
              background: '#1e1e1e', border: '0.5px solid #333',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 6,
              background: '#1e1e1e', border: '0.5px solid #333',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            background: '#2d0a0a', border: '0.5px solid #5a1a1a',
            borderRadius: 6, padding: '8px 12px', fontSize: 13,
            color: '#ff6b6b', marginBottom: 16
          }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 6,
            background: loading ? '#7a0008' : '#e50914', border: 'none',
            color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </span>
        </div>
      </div>
    </div>
  )
}