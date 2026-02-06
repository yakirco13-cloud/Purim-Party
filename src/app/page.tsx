'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relation: '',
    guestCount: '1',
    note: '',
    consent: false,
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="relative bg-white border border-gray-200 rounded-sm p-10 max-w-md w-full text-center shadow-lg">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-4">
            <span className="text-[#007272] text-sm tracking-[0.3em] uppercase">Laiysh Group</span>
          </div>
          <div className="text-5xl mb-6">🎭</div>
          <h1 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">הבקשה נשלחה בהצלחה</h1>
          <div className="w-16 h-px bg-[#007272] mx-auto mb-6"></div>
          <p className="text-gray-500 mb-4 leading-relaxed">
            שלחנו לך מייל אישור. ברגע שהבקשה תאושר, תקבל מייל נוסף עם QR code.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 mb-4 text-amber-700 text-sm">
            שים לב — שליחת הבקשה אינה מהווה אישור השתתפות. תקבל מייל נפרד במידה ותאושר.
          </div>
          <p className="text-[#007272] text-sm">בדוק גם בתיקיית הספאם 📧</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      <div className="relative bg-white border border-gray-200 rounded-sm p-8 max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#007272]"></div>
            <span className="text-[#007272] text-xs tracking-[0.3em] uppercase">1993</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#007272]"></div>
          </div>
          <h1 className="text-3xl font-light text-gray-900 tracking-wider mb-1">LAIYSH</h1>
          <p className="text-[#007272] tracking-[0.4em] text-sm uppercase">Group</p>
          <div className="mt-4 mb-2">
            <span className="text-gray-900 text-xl">מסיבת פורים 2026</span>
          </div>
          <p className="text-gray-400 text-sm">הזמנה אישית</p>
        </div>

        {/* Event Details */}
        <div className="border border-gray-200 rounded-sm p-4 mb-6 space-y-3 text-gray-500 text-sm">
          <div className="flex justify-between items-center">
            <span>📅 תאריך</span>
            <span className="text-gray-900">יום חמישי, 5 במרץ</span>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div className="flex justify-between items-center">
            <span>🕢 שעה</span>
            <span className="text-gray-900">19:30</span>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div className="flex justify-between items-center">
            <span>📍 מיקום</span>
            <a
              href="https://maps.google.com/?q=הכישור+14+חולון"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007272] hover:text-[#009999] transition"
            >
              הכישור 14, חולון
            </a>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div className="flex justify-between items-center">
            <span>🚗 חניה</span>
            <span className="text-gray-900">חניון מרכז הסיירים</span>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div className="flex justify-between items-center">
            <span>🎭 קוד לבוש</span>
            <span className="text-[#007272] font-medium">תחפושות בלבד!</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">שם מלא *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition placeholder-gray-300"
              placeholder="הכנס את שמך המלא"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">אימייל *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition placeholder-gray-300"
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">טלפון *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition placeholder-gray-300"
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">קרבה *</label>
            <input
              type="text"
              required
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition placeholder-gray-300"
              placeholder="לדוגמה: עובד, ספק, לקוח"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">מספר אורחים (כולל אותך)</label>
            <select
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition"
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">הערות (אופציונלי)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition resize-none placeholder-gray-300"
              rows={2}
              placeholder="משהו שחשוב לנו לדעת?"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 w-4 h-4 accent-[#007272] cursor-pointer"
            />
            <span className="text-gray-500 text-xs leading-relaxed">
              אני מסכים/ה לקבלת עדכונים במייל בנוגע לאירוע זה, כולל אישור הרשמה וקוד כניסה *
            </span>
          </label>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#007272] hover:bg-[#008888] text-white font-medium py-4 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed tracking-wider uppercase text-sm"
          >
            {status === 'loading' ? 'שולח...' : 'שלח בקשה להשתתפות'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-xs">לבירורים ניתן לפנות לאריק עזריאל במספר <a href="tel:0545243335" className="text-[#007272] hover:text-[#009999] transition">054-524-3335</a></p>
        </div>
      </div>
    </main>
  )
}
