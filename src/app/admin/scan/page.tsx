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

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const startScanning = async () => {
    setResult(null)
    setError(null)
    setScanning(true)

    try {
      const reader = new BrowserMultiFormatReader()
      
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (decoded) => {
          if (decoded) {
            const qrToken = decoded.getText()
            await checkIn(qrToken)
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

  const checkIn = async (qrToken: string) => {
    stopScanning()

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
      })

      const data = await res.json()
      setResult(data)

      // Auto-reset after 5 seconds for continuous scanning
      setTimeout(() => {
        setResult(null)
      }, 5000)
    } catch (err) {
      console.error('Check-in error:', err)
      setResult({ valid: false, error: 'שגיאה בבדיקת הקוד' })
    }
  }

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/admin" className="text-gray-400 hover:text-white transition">
            ← חזרה
          </Link>
          <h1 className="text-xl font-bold text-white">📷 סריקת QR</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Result Display */}
        {result && (
          <div
            className={`w-full max-w-lg rounded-3xl p-8 mb-6 text-center ${
              result.valid
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-red-500/20 border-2 border-red-500'
            }`}
          >
            {result.valid ? (
              <>
                <div className="text-6xl mb-4">✅</div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  ברוך הבא!
                </div>
                <div className="text-2xl text-white mb-2">{result.guest?.name}</div>
                {result.guest?.guestCount && result.guest.guestCount > 1 && (
                  <div className="text-purple-400">
                    +{result.guest.guestCount - 1} אורחים
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <div className="text-2xl font-bold text-red-400 mb-2">
                  {result.error}
                </div>
                {result.guest?.name && (
                  <div className="text-white">{result.guest.name}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Scanner */}
        <div className="w-full max-w-lg">
          {scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-3xl bg-black"
                style={{ aspectRatio: '1' }}
              />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-3xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-amber-400 rounded-2xl"></div>
              </div>
              <button
                onClick={stopScanning}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition"
              >
                ⏹️ עצור סריקה
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-3xl p-8 text-center">
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 text-red-400">
                  {error}
                </div>
              )}
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-400 mb-6">לחץ להפעלת הסורק</p>
              <button
                onClick={startScanning}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-xl transition shadow-lg"
              >
                🎭 התחל סריקה
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-500 text-sm max-w-lg">
          <p>כוון את המצלמה לעבר קוד ה-QR של האורח</p>
          <p>הסריקה אוטומטית - אין צורך ללחוץ</p>
        </div>
      </main>
    </div>
  )
}