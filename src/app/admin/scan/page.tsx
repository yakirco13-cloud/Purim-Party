'use client'

import { useState, useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import Link from 'next/link'

type ScanResult = {
  valid: boolean
  error?: string
  guest?: {
    name: string
    guestCount?: number
    checkedInAt?: string
  }
}

type PendingGuest = {
  qrToken: string
  name: string
  guestCount: number
  status: 'approved' | 'pending' | 'rejected'
  alreadyCheckedIn: boolean
  checkedInCount: number
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [pendingGuest, setPendingGuest] = useState<PendingGuest | null>(null)
  const [adjustedCount, setAdjustedCount] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const startScanning = async () => {
    setResult(null)
    setPendingGuest(null)
    setError(null)
    setScanning(true)

    try {
      const reader = new BrowserMultiFormatReader()

      // Get video devices and prefer back camera
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      const backCamera = videoDevices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      )

      const deviceId = backCamera?.deviceId || undefined

      const controls = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (decoded) => {
          if (decoded) {
            const qrToken = decoded.getText()
            await lookupGuest(qrToken)
          }
        }
      )
      controlsRef.current = controls
    } catch (err) {
      console.error('Scanner error:', err)
      setError('לא הצלחנו לגשת למצלמה. בדוק את ההרשאות.')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    setScanning(false)
  }

  const lookupGuest = async (qrToken: string) => {
    stopScanning()
    setProcessing(true)

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
      })

      const data = await res.json()

      if (data.error) {
        setResult({ valid: false, error: data.error })
        setTimeout(() => setResult(null), 3000)
      } else {
        const checkedInCount = data.guest.checkedInCount || 0
        const remaining = data.guest.guestCount - checkedInCount
        setPendingGuest({
          qrToken,
          name: data.guest.name,
          guestCount: data.guest.guestCount,
          status: data.guest.status,
          alreadyCheckedIn: checkedInCount >= data.guest.guestCount,
          checkedInCount,
        })
        setAdjustedCount(remaining > 0 ? remaining : 1)
      }
    } catch (err) {
      console.error('Lookup error:', err)
      setResult({ valid: false, error: 'שגיאה בבדיקת הקוד' })
    }

    setProcessing(false)
  }

  const confirmCheckIn = async () => {
    if (!pendingGuest) return
    setProcessing(true)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: pendingGuest.qrToken, guestCount: adjustedCount }),
      })

      const data = await res.json()
      setResult(data)
      setPendingGuest(null)

      // Auto-reset after 4 seconds
      setTimeout(() => {
        setResult(null)
      }, 4000)
    } catch (err) {
      console.error('Check-in error:', err)
      setResult({ valid: false, error: 'שגיאה בצ׳ק-אין' })
    }

    setProcessing(false)
  }

  const cancelCheckIn = () => {
    setPendingGuest(null)
  }

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/admin" className="text-[#007272] hover:text-[#009999] transition text-sm">
            → חזרה
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-light text-gray-900 tracking-wider">סריקת QR</h1>
            <p className="text-[#007272] text-xs tracking-widest">LAIYSH GROUP</p>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">

        {/* Pending Guest Confirmation */}
        {pendingGuest && (
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-sm p-6 mb-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎭</div>
              <h2 className="text-2xl font-light text-gray-900 mb-1">{pendingGuest.name}</h2>
              <div className="flex items-center justify-center gap-3 text-[#007272] mt-2">
                <button
                  type="button"
                  onClick={() => setAdjustedCount(Math.max(1, adjustedCount - 1))}
                  className="w-9 h-9 flex items-center justify-center border border-[#007272] rounded-sm text-[#007272] hover:bg-[#007272] hover:text-white transition text-lg font-bold"
                >
                  &lt;
                </button>
                <span className="text-2xl font-light min-w-[2rem] text-center">{adjustedCount}</span>
                <button
                  type="button"
                  onClick={() => setAdjustedCount(adjustedCount + 1)}
                  className="w-9 h-9 flex items-center justify-center border border-[#007272] rounded-sm text-[#007272] hover:bg-[#007272] hover:text-white transition text-lg font-bold"
                >
                  &gt;
                </button>
                <span className="text-sm">{adjustedCount === 1 ? 'אורח' : 'אורחים'}</span>
              </div>
            </div>

            {pendingGuest.checkedInCount > 0 && pendingGuest.checkedInCount < pendingGuest.guestCount ? (
              <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mb-4 text-center">
                <p className="text-blue-600">נכנסו {pendingGuest.checkedInCount}/{pendingGuest.guestCount}</p>
              </div>
            ) : pendingGuest.alreadyCheckedIn ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 mb-4 text-center">
                <p className="text-yellow-600">⚠️ כל האורחים כבר נכנסו ({pendingGuest.guestCount}/{pendingGuest.guestCount})</p>
              </div>
            ) : pendingGuest.status !== 'approved' ? (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-4 text-center">
                <p className="text-red-600">❌ האורח לא אושר</p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={cancelCheckIn}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-sm transition font-medium"
              >
                ביטול
              </button>
              {pendingGuest.status === 'approved' && !pendingGuest.alreadyCheckedIn && (
                <button
                  onClick={confirmCheckIn}
                  disabled={processing}
                  className="flex-1 bg-[#007272] hover:bg-[#008888] text-white py-3 rounded-sm transition font-medium disabled:opacity-50"
                >
                  {processing ? '...' : '✓ אשר כניסה'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div
            className={`w-full max-w-lg rounded-sm p-8 mb-6 text-center border ${
              result.valid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {result.valid ? (
              <>
                <div className="text-6xl mb-4">✓</div>
                <div className="text-2xl font-light text-green-600 mb-2">
                  ברוך הבא!
                </div>
                <div className="text-xl text-gray-900 mb-2">{result.guest?.name}</div>
                {result.guest?.guestCount && result.guest.guestCount > 1 && (
                  <div className="text-[#007272]">
                    +{result.guest.guestCount - 1} אורחים
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">✗</div>
                <div className="text-xl font-light text-red-500 mb-2">
                  {result.error}
                </div>
                {result.guest?.name && (
                  <div className="text-gray-900">{result.guest.name}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Scanner */}
        {!pendingGuest && !result && (
          <div className="w-full max-w-lg">
            {scanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-sm bg-gray-900"
                  style={{ aspectRatio: '1' }}
                />
                <div className="absolute inset-0 border-2 border-[#007272] rounded-sm pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#007272]/50 rounded-sm">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#007272]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#007272]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#007272]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#007272]"></div>
                  </div>
                </div>
                {processing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-lg">מעבד...</div>
                  </div>
                )}
                <button
                  onClick={stopScanning}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white text-gray-700 px-6 py-2 rounded-sm transition text-sm shadow"
                >
                  עצור סריקה
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-sm p-8 text-center shadow-lg">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <div className="w-16 h-16 mx-auto mb-4 border border-[#007272] rounded-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#007272]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-6 text-sm">לחץ להפעלת הסורק</p>
                <button
                  onClick={startScanning}
                  className="bg-[#007272] hover:bg-[#008888] text-white px-8 py-3 rounded-sm transition tracking-wider uppercase text-sm"
                >
                  התחל סריקה
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!pendingGuest && !result && (
          <div className="mt-6 text-center text-gray-400 text-xs max-w-lg">
            <p>כוון את המצלמה לעבר קוד ה-QR של האורח</p>
          </div>
        )}
      </main>
    </div>
  )
}
