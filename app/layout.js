import { AppProvider } from './context/AppContext'
import Script from 'next/script'
import PageAnimate from './components/PageAnimate'

export const metadata = {
  title: 'NUSAFLIX — Premium Streaming Lokal 🍿',
  description: 'Nikmati film dan series premium pilihan hanya di Nusaflix. Streaming lancar, kualitas HD, dan konten eksklusif.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0 }}>
        <AppProvider>
          <PageAnimate>
            {children}
          </PageAnimate>
        </AppProvider>
        {/* Midtrans Snap JS (Sandbox Mode) */}
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}