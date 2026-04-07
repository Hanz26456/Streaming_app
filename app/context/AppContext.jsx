'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const defaultColors = {
  bg: '#0a0a0f',
  bgCard: '#111',
  bgNav: 'rgba(0,0,0,0.95)',
  bgInput: '#1a1a2e',
  text: '#ffffff',
  textMuted: '#aaa',
  textSub: '#888',
  border: '#1a1a1a',
  borderMuted: '#333',
  cardBg: '#1a1a1a',
}

// ✅ Tambah default value di sini
const AppContext = createContext({
  theme: 'dark',
  lang: 'id',
  colors: defaultColors,
  toggleTheme: () => {},
  toggleLang: () => {},
})

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [lang, setLang] = useState('id')

  useEffect(() => {
    const savedTheme = localStorage.getItem('nusaflix-theme') || 'dark'
    const savedLang = localStorage.getItem('nusaflix-lang') || 'id'
    setTheme(savedTheme)
    setLang(savedLang)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('nusaflix-theme', next)
      return next
    })
  }

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'id' ? 'en' : 'id'
      localStorage.setItem('nusaflix-lang', next)
      return next
    })
  }
  const colors = theme === 'dark' ? {
    bg: '#0a0a0f',
    bgCard: '#111',
    bgNav: 'rgba(0,0,0,0.95)',
    bgInput: '#1a1a2e',
    text: '#ffffff',
    textMuted: '#aaa',
    textSub: '#888',
    border: '#1a1a1a',
    borderMuted: '#333',
    cardBg: '#1a1a1a',
  } : {
    bg: '#f0f0f5',
    bgCard: '#ffffff',
    bgNav: 'rgba(255,255,255,0.97)',
    bgInput: '#f5f5f5',
    text: '#111111',
    textMuted: '#555',
    textSub: '#777',
    border: '#e0e0e0',
    borderMuted: '#ccc',
    cardBg: '#e8e8e8',
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, colors }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)