'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guestCount: '1',
    note: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'משהו השתבש')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'משהו השתבש')
    }
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-purple-500/20">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-2xl font-bold text-green-400 mb-4">הבקשה נשלחה בהצלחה!</h1>
          <p className="text-gray-300 mb-4">
            שלחנו לך מייל אישור. ברגע שהבקשה תאושר, תקבל מייל נוסף עם QR code.
          </p>
          <p className="text-amber-400 text-sm">בדוק גם בתיקיית הספאם 📧</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎭 מסיבת פורים</h1>
          <p className="text-amber-400 text-xl font-semibold">Laiysh Group</p>
        </div>

        {/* Event Details */}
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-6 space-y-2 text-gray-300">
          <p>📅 יום חמישי, 5 במרץ 2026</p>
          <p>🕢 19:30</p>
          <p>
            📍{' '}
            <a
              href="https://maps.google.com/?q=הכישור+14+חולון"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              הכישור 14, חולון
            </a>
          </p>
          <p>🚗 חניה: חניון מרכז הסיירים</p>
          <p className="text-pink-400 font-semibold">👗 קוד לבוש: תחפושות בלבד!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">שם מלא *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              placeholder="איך קוראים לך?"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">אימייל *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">טלפון *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">כמה אנשים? (כולל אותך)</label>
            <select
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">הערות (אופציונלי)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
              rows={2}
              placeholder="משהו שחשוב לנו לדעת?"
            />
          </div>

          {status === 'error' && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {status === 'loading' ? '⏳ שולח...' : '🎭 שלח בקשה'}
          </button>
        </form>
      </div>
    </main>
  )
}
