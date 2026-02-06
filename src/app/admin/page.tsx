'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Guest = {
  id: string
  name: string
  email: string
  phone: string
  guest_count: number
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  checked_in: boolean
  created_at: string
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchGuests()
    }
  }, [isLoggedIn])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginError('אימייל או סיסמה שגויים')
    } else {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
  }

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGuests(data)
    }
  }

  const handleAction = async (guestId: string, action: 'approve' | 'reject') => {
    setActionLoading(guestId)
    
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, action }),
      })

      if (res.ok) {
        await fetchGuests()
      }
    } catch (error) {
      console.error('Action error:', error)
    }
    
    setActionLoading(null)
  }

  const filteredGuests = guests.filter((g) => 
    filter === 'all' ? true : g.status === filter
  )

  const stats = {
    total: guests.length,
    pending: guests.filter((g) => g.status === 'pending').length,
    approved: guests.filter((g) => g.status === 'approved').length,
    rejected: guests.filter((g) => g.status === 'rejected').length,
    checkedIn: guests.filter((g) => g.checked_in).length,
    totalPeople: guests
      .filter((g) => g.status === 'approved')
      .reduce((sum, g) => sum + g.guest_count, 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">⏳ טוען...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-500/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🔐 כניסת מנהל</h1>
            <p className="text-gray-400">מסיבת פורים - Laiysh Group</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm">אימייל</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm">סיסמה</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 text-red-400 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition shadow-lg"
            >
              🚀 התחבר
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🎭 לוח בקרה</h1>
            <p className="text-gray-400 text-sm">מסיבת פורים - Laiysh Group</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/scan"
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-medium transition"
            >
              📷 סריקת QR
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400 text-sm">סה״כ בקשות</div>
          </div>
          <div className="bg-amber-500/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-gray-400 text-sm">ממתינים</div>
          </div>
          <div className="bg-green-500/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-gray-400 text-sm">אושרו</div>
          </div>
          <div className="bg-purple-500/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.totalPeople}</div>
            <div className="text-gray-400 text-sm">סה״כ אנשים</div>
          </div>
          <div className="bg-blue-500/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.checkedIn}</div>
            <div className="text-gray-400 text-sm">נכנסו</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' && 'הכל'}
              {f === 'pending' && '⏳ ממתינים'}
              {f === 'approved' && '✅ אושרו'}
              {f === 'rejected' && '❌ נדחו'}
            </button>
          ))}
          <button
            onClick={fetchGuests}
            className="px-4 py-2 rounded-xl font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition mr-auto"
          >
            🔄 רענן
          </button>
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-400">
              אין בקשות להצגה
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg">{guest.name}</span>
                    <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                      {guest.guest_count} {guest.guest_count === 1 ? 'אורח' : 'אורחים'}
                    </span>
                    {guest.checked_in && (
                      <span className="bg-green-500/30 text-green-300 text-xs px-2 py-1 rounded-full">
                        ✓ נכנס
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm space-x-4 space-x-reverse">
                    <span>{guest.email}</span>
                    <span>{guest.phone}</span>
                  </div>
                  {guest.note && (
                    <div className="text-gray-500 text-sm mt-1">💬 {guest.note}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  {guest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(guest.id, 'approve')}
                        disabled={actionLoading === guest.id}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === guest.id ? '⏳' : '✅ אשר'}
                      </button>
                      <button
                        onClick={() => handleAction(guest.id, 'reject')}
                        disabled={actionLoading === guest.id}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === guest.id ? '⏳' : '❌ דחה'}
                      </button>
                    </>
                  )}
                  {guest.status === 'approved' && (
                    <span className="text-green-400 font-medium">✅ אושר</span>
                  )}
                  {guest.status === 'rejected' && (
                    <span className="text-red-400 font-medium">❌ נדחה</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
