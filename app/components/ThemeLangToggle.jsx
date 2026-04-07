'use client'
import { useApp } from '@/context/AppContext'

export default function ThemeLangToggle() {
  const { theme, toggleTheme, lang, toggleLang } = useApp()

  // Fungsi pembantu agar klik tidak bocor ke Navbar
  const handleToggleLang = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    toggleLang();
  };

  const handleToggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1001 }}>
      {/* Toggle Bahasa */}
      <button 
        onClick={handleToggleLang} 
        style={{
          background: 'transparent',
          border: '0.5px solid #555',
          color: '#ccc',
          padding: '5px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'auto' // Memastikan tombol menangkap klik
        }}
      >
        {lang === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}
      </button>

      {/* Toggle Tema */}
      <button 
        onClick={handleToggleTheme} 
        style={{
          background: 'transparent',
          border: '0.5px solid #555',
          color: '#ccc',
          padding: '5px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          pointerEvents: 'auto'
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  )
}