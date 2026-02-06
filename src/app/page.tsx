'use client'

import { useState, useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
  decay: number
  gravity: number
  trail: Array<{ x: number; y: number; alpha: number }>
}

type Firework = {
  x: number
  y: number
  targetY: number
  vy: number
  color: string
  exploded: boolean
  trail: Array<{ x: number; y: number; alpha: number }>
}

function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: Particle[] = []
    const fireworks: Firework[] = []
    let lastSpawn = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = [
      ['#ff4444', '#ff8866', '#ffaa88'],
      ['#FFD700', '#FFA500', '#ffcc44'],
      ['#44aaff', '#66ccff', '#88ddff'],
      ['#ff66cc', '#ff88dd', '#ffaaee'],
      ['#ffffff', '#ddddff', '#aabbff'],
      ['#44ffaa', '#66ffcc', '#88ffdd'],
    ]

    function spawnFirework() {
      const colorSet = colors[Math.floor(Math.random() * colors.length)]
      fireworks.push({
        x: Math.random() * canvas!.width * 0.6 + canvas!.width * 0.2,
        y: canvas!.height,
        targetY: Math.random() * canvas!.height * 0.4 + canvas!.height * 0.1,
        vy: -(8 + Math.random() * 4),
        color: colorSet[0],
        exploded: false,
        trail: [],
      })
    }

    function explode(x: number, y: number, colorSet: string[]) {
      const count = 80 + Math.floor(Math.random() * 40)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
        const speed = 2 + Math.random() * 4
        const color = colorSet[Math.floor(Math.random() * colorSet.length)]
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 1.5 + Math.random() * 1.5,
          decay: 0.008 + Math.random() * 0.008,
          gravity: 0.03 + Math.random() * 0.02,
          trail: [],
        })
      }
      // Sparkle core
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 1.5
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: '#ffffff',
          size: 1 + Math.random(),
          decay: 0.02 + Math.random() * 0.02,
          gravity: 0.01,
          trail: [],
        })
      }
    }

    function getColorSet(color: string) {
      return colors.find(c => c[0] === color) || colors[0]
    }

    function animate(time: number) {
      ctx!.globalCompositeOperation = 'source-over'
      ctx!.fillStyle = 'rgba(43, 42, 42, 0.15)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.globalCompositeOperation = 'lighter'

      // Spawn fireworks
      if (time - lastSpawn > 600 + Math.random() * 1500) {
        spawnFirework()
        if (Math.random() > 0.5) spawnFirework() // sometimes double
        lastSpawn = time
      }

      // Update fireworks (rising)
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i]
        fw.trail.push({ x: fw.x, y: fw.y, alpha: 0.8 })
        if (fw.trail.length > 8) fw.trail.shift()

        fw.y += fw.vy
        fw.vy += 0.08 // gravity on rise

        // Draw trail
        for (let t = 0; t < fw.trail.length; t++) {
          const pt = fw.trail[t]
          pt.alpha *= 0.85
          ctx!.beginPath()
          ctx!.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(255, 200, 100, ${pt.alpha})`
          ctx!.fill()
        }

        // Draw firework
        ctx!.beginPath()
        ctx!.arc(fw.x, fw.y, 3, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 220, 150, 1)`
        ctx!.fill()

        // Explode
        if (fw.y <= fw.targetY || fw.vy >= 0) {
          explode(fw.x, fw.y, getColorSet(fw.color))
          fireworks.splice(i, 1)
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.5 })
        if (p.trail.length > 5) p.trail.shift()

        p.vx *= 0.98
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        // Draw trail
        for (let t = 0; t < p.trail.length; t++) {
          const pt = p.trail[t]
          pt.alpha *= 0.7
          ctx!.beginPath()
          ctx!.arc(pt.x, pt.y, p.size * 0.6, 0, Math.PI * 2)
          ctx!.fillStyle = `${p.color}${Math.floor(pt.alpha * 255).toString(16).padStart(2, '0')}`
          ctx!.fill()
        }

        // Draw particle
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`
        ctx!.fill()

        // Glow
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx!.fillStyle = `${p.color}${Math.floor(p.alpha * 40).toString(16).padStart(2, '0')}`
        ctx!.fill()

        if (p.alpha <= 0) {
          particles.splice(i, 1)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    // Initial burst
    setTimeout(spawnFirework, 200)
    setTimeout(spawnFirework, 500)
    setTimeout(spawnFirework, 900)
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

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
      <main className="min-h-screen bg-[#2B2A2A] flex items-center justify-center p-4 relative">
        <Fireworks />
        <div className="relative bg-white p-10 max-w-md w-full text-center shadow-[0_0_60px_rgba(255,255,255,0.15)]" style={{ zIndex: 2 }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2B2A2A] px-4">
            <span className="text-white text-sm tracking-[0.3em] uppercase">Laiysh Group</span>
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
    <main className="min-h-screen bg-[#2B2A2A] flex items-center justify-center p-4 relative">
      <Fireworks />

      <div className="relative bg-white p-8 max-w-md w-full shadow-[0_0_60px_rgba(255,255,255,0.15)]" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#007272]"></div>
            <span className="text-[#007272] text-xs tracking-[0.3em] uppercase">1993</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#007272]"></div>
          </div>
          <h1 className="text-3xl font-light text-gray-900 tracking-wider mb-1">LAIYSH</h1>
          <p className="text-[#007272] tracking-[0.4em] text-sm uppercase">Group</p>
        </div>

        {/* Welcome */}
        <div className="text-center mb-5">
          <p className="text-gray-900 text-lg font-medium mb-3">ברוכים הבאים למסיבת פורים 2026 ✨🎭</p>
          <div className="text-gray-500 text-sm space-y-1">
            <p>יום חמישי | 5.3.26</p>
            <p>19:30 🕢</p>
            <p>הכישור 14, חולון 📍</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5 text-center">
          <p className="text-gray-500 text-sm leading-relaxed mb-3">
            אז מה מחכה לכם? דוכני אוכל שווים, בר אלכוהול מפנק, ליינאפ משוגע, סאונד פגז ואווירת פורים מטורפת.
          </p>
          <p className="text-[#007272] text-sm font-medium">הכניסה ללא עלות ובהרשמה מראש בלבד!</p>
        </div>

        {/* Registration Info */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm text-gray-900 leading-relaxed space-y-2 text-center font-bold">
          <p>נרשמתם? קודם תקבלו מייל קטן שמאשר שקיבלנו את ההרשמה 😉</p>
          <p>לאחר אישור המארגנים, יישלח מייל נוסף עם ברקוד - וזה הכרטיס שלכם למסיבה.</p>
          <p>עדיין מתלבטים? הכל טוב, חכו רגע עם ההרשמה.<br />מבחינתנו מי שנרשם, מגיע - ומספר המקומות מוגבל.</p>
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
              placeholder="לדוגמה: משפחה, חברים, עובד"
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
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
          <p className="text-gray-900 text-base leading-relaxed font-bold">
            מבקשים לא להעביר את הקישור לאחרים – הכניסה למוזמנים בלבד.
            <br />
            רוצים לצרף חברים? דברו איתנו, ובמידה ויתאפשר נשמח לאשר 🩵
          </p>
          <p className="text-gray-400 text-xs">לבירורים ניתן לפנות לאריק עזריאל במספר <a href="tel:0545243335" className="text-[#007272] hover:text-[#009999] transition">054-524-3335</a></p>
        </div>
      </div>
    </main>
  )
}
