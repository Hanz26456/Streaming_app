'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useApp } from '@/context/AppContext'

export default function ReviewSection({ movieId, seriesId }) {
  const { colors, lang } = useApp()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, likes: 0, dislikes: 0, ratingPercent: 0 })
  const [loading, setLoading] = useState(true)
  const [myReview, setMyReview] = useState({ liked: true, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const params = movieId ? `movieId=${movieId}` : `seriesId=${seriesId}`
      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      if (res.ok) {
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [movieId, seriesId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const token = Cookies.get('token')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          seriesId,
          liked: myReview.liked,
          comment: myReview.comment
        })
      })
      if (res.ok) {
        setMyReview({ ...myReview, comment: '' })
        fetchReviews()
      }
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: 40, borderTop: `1px solid ${colors.border}`, paddingTop: 32 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: colors.text }}>
        {lang === 'id' ? 'Ulasan Pengguna' : 'User Reviews'}
      </h3>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#e50914' }}>{stats.ratingPercent}%</div>
          <div style={{ fontSize: 12, color: colors.textSub, textTransform: 'uppercase' }}>
            {lang === 'id' ? 'Suka' : 'Liked'}
          </div>
        </div>
        <div style={{ flex: 1, height: 8, background: colors.bgInput, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${stats.ratingPercent}%`, background: '#e50914', height: '100%' }} />
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted }}>
          {stats.total} {lang === 'id' ? 'Ulasan' : 'Reviews'}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: colors.cardBg, padding: 20, borderRadius: 12, border: `1px solid ${colors.border}`, marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {lang === 'id' ? 'Berikan ulasan Anda' : 'Leave your review'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => setMyReview({ ...myReview, liked: true })}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: myReview.liked ? 'rgba(70,211,105,0.1)' : 'transparent',
                border: `1px solid ${myReview.liked ? '#46d369' : colors.borderMuted}`,
                color: myReview.liked ? '#46d369' : colors.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600
              }}
            >
              👍 {lang === 'id' ? 'Suka' : 'Like'}
            </button>
            <button
              type="button"
              onClick={() => setMyReview({ ...myReview, liked: false })}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: !myReview.liked ? 'rgba(229,9,20,0.1)' : 'transparent',
                border: `1px solid ${!myReview.liked ? '#e50914' : colors.borderMuted}`,
                color: !myReview.liked ? '#e50914' : colors.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600
              }}
            >
              👎 {lang === 'id' ? 'Tidak Suka' : 'Dislike'}
            </button>
          </div>
        </div>
        <textarea
          value={myReview.comment}
          onChange={(e) => setMyReview({ ...myReview, comment: e.target.value })}
          placeholder={lang === 'id' ? 'Tulis komentar Anda (opsional)...' : 'Write your comment (optional)...'}
          style={{
            width: '100%', minHeight: 80, background: colors.bgInput, border: `1px solid ${colors.borderMuted}`,
            color: colors.text, borderRadius: 8, padding: 12, fontSize: 14, outline: 'none', marginBottom: 16,
            resize: 'vertical', boxSizing: 'border-box'
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: '#e50914', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? (lang === 'id' ? 'Mengirim...' : 'Sending...') : (lang === 'id' ? 'Kirim Ulasan' : 'Submit Review')}
        </button>
      </form>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loading ? (
          <div style={{ color: colors.textSub, textAlign: 'center' }}>{lang === 'id' ? 'Memuat ulasan...' : 'Loading reviews...'}</div>
        ) : reviews.length === 0 ? (
          <div style={{ color: colors.textSub, textAlign: 'center', padding: '20px 0' }}>
            {lang === 'id' ? 'Belum ada ulasan. Jadilah yang pertama!' : 'No reviews yet. Be the first!'}
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: colors.bgInput, overflow: 'hidden', flexShrink: 0 }}>
                {rev.user?.avatarUrl ? (
                  <img src={rev.user.avatarUrl} alt={rev.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{rev.user?.name}</span>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                   <span style={{ fontSize: 12, color: rev.liked ? '#46d369' : '#e50914', fontWeight: 700 }}>
                    {rev.liked ? '👍 RECOMMENDED' : '👎 NOT RECOMMENDED'}
                  </span>
                </div>
                {rev.comment && (
                  <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.5 }}>{rev.comment}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
