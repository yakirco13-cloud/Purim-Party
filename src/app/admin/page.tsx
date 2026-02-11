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
  relation: string | null
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
  const [editingGuest, setEditingGuest] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ guestId: string; guestName: string; action: 'approve' | 'reject' } | null>(null)

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

  const filteredGuests = guests.filter((g) => {
    const matchesFilter = filter === 'all' ? true : g.status === filter
    const matchesSearch = search === '' || g.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    totalPeople: guests.reduce((sum, g) => sum + g.guest_count, 0),
    pendingPeople: guests.filter((g) => g.status === 'pending').reduce((sum, g) => sum + g.guest_count, 0),
    approvedPeople: guests.filter((g) => g.status === 'approved').reduce((sum, g) => sum + g.guest_count, 0),
    checkedIn: guests.filter((g) => g.checked_in).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#007272] text-sm tracking-widest">טוען...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="relative bg-white border border-gray-200 rounded-sm p-8 max-w-md w-full shadow-lg">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#007272]"></div>
              <span className="text-[#007272] text-xs tracking-[0.3em] uppercase">Admin</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#007272]"></div>
            </div>
            <h1 className="text-2xl font-light text-gray-900 tracking-wider mb-1">LAIYSH</h1>
            <p className="text-[#007272] tracking-[0.4em] text-xs uppercase">Group</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">אימייל</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-2 text-xs tracking-wider uppercase">סיסמה</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-red-600 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#007272] hover:bg-[#008888] text-white py-3 rounded-sm transition tracking-wider uppercase text-sm"
            >
              התחבר
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light text-gray-900 tracking-wider">לוח בקרה</h1>
            <p className="text-[#007272] text-xs tracking-widest">LAIYSH GROUP</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/scan"
              className="bg-[#007272] hover:bg-[#008888] text-white px-4 py-2 rounded-sm transition text-sm tracking-wider"
            >
              סריקת QR
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-900 transition text-sm"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-sm p-4 text-center shadow-sm">
            <div className="text-2xl font-light text-gray-900">{stats.totalPeople}</div>
            <div className="text-gray-400 text-xs tracking-wider uppercase">סה״כ אנשים</div>
          </div>
          <div className="bg-white border border-yellow-200 rounded-sm p-4 text-center shadow-sm">
            <div className="text-2xl font-light text-yellow-600">{stats.pendingPeople}</div>
            <div className="text-gray-400 text-xs tracking-wider uppercase">ממתינים</div>
          </div>
          <div className="bg-white border border-green-200 rounded-sm p-4 text-center shadow-sm">
            <div className="text-2xl font-light text-green-600">{stats.approvedPeople}</div>
            <div className="text-gray-400 text-xs tracking-wider uppercase">אושרו</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-sm p-4 text-center shadow-sm">
            <div className="text-2xl font-light text-blue-500">{stats.checkedIn}</div>
            <div className="text-gray-400 text-xs tracking-wider uppercase">נכנסו</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-sm text-sm transition ${
                filter === f
                  ? 'bg-[#007272] text-white'
                  : 'bg-white border border-gray-200 text-gray-400 hover:border-[#007272] hover:text-[#007272]'
              }`}
            >
              {f === 'all' && 'הכל'}
              {f === 'pending' && 'ממתינים'}
              {f === 'approved' && 'אושרו'}
              {f === 'rejected' && 'נדחו'}
            </button>
          ))}
          <button
            onClick={fetchGuests}
            className="px-4 py-2 rounded-sm text-sm bg-white border border-gray-200 text-gray-400 hover:border-[#007272] hover:text-[#007272] transition mr-auto"
          >
            רענן
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="w-full bg-white border border-gray-200 rounded-sm px-4 py-3 text-gray-900 focus:outline-none focus:border-[#007272] transition placeholder-gray-300 text-sm"
          />
        </div>

        {/* Guest List */}
        <div className="space-y-2">
          {filteredGuests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-sm p-8 text-center text-gray-400 shadow-sm">
              אין בקשות להצגה
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gray-900 font-light text-lg">{guest.name}</span>
                    <span className="bg-[#007272]/10 text-[#007272] text-xs px-2 py-1 rounded-sm">
                      {guest.guest_count} {guest.guest_count === 1 ? 'אורח' : 'אורחים'}
                    </span>
                    {guest.checked_in && (
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-sm">
                        ✓ נכנס
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm space-x-3 space-x-reverse">
                    <span>{guest.email}</span>
                    <span>•</span>
                    <span>{guest.phone}</span>
                  </div>
                  {guest.relation && (
                    <div className="text-gray-400 text-sm mt-1">🔗 {guest.relation}</div>
                  )}
                  {guest.note && (
                    <div className="text-gray-400 text-sm mt-1">💬 {guest.note}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {guest.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(guest.id, 'approve')}
                        disabled={actionLoading === guest.id}
                        className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-sm text-sm transition disabled:opacity-50"
                      >
                        {actionLoading === guest.id ? '...' : '✓ אשר'}
                      </button>
                      <button
                        onClick={() => handleAction(guest.id, 'reject')}
                        disabled={actionLoading === guest.id}
                        className="bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded-sm text-sm transition disabled:opacity-50"
                      >
                        {actionLoading === guest.id ? '...' : '✗ דחה'}
                      </button>
                    </>
                  ) : editingGuest === guest.id ? (
                    <>
                      {guest.status === 'approved' ? (
                        <button
                          onClick={() => { setConfirmDialog({ guestId: guest.id, guestName: guest.name, action: 'reject' }); setEditingGuest(null) }}
                          className="bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded-sm text-sm transition"
                        >
                          ✗ העבר לנדחה
                        </button>
                      ) : (
                        <button
                          onClick={() => { setConfirmDialog({ guestId: guest.id, guestName: guest.name, action: 'approve' }); setEditingGuest(null) }}
                          className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-sm text-sm transition"
                        >
                          ✓ העבר לאושר
                        </button>
                      )}
                      <button
                        onClick={() => setEditingGuest(null)}
                        className="text-gray-400 hover:text-gray-600 px-2 py-2 text-sm transition"
                      >
                        ביטול
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${guest.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                        {guest.status === 'approved' ? '✓ אושר' : '✗ נדחה'}
                      </span>
                      <button
                        onClick={() => setEditingGuest(guest.id)}
                        className="text-gray-300 hover:text-[#007272] transition p-1"
                        title="שנה סטטוס"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-light text-gray-900 mb-3 text-center">שינוי סטטוס</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                {confirmDialog.action === 'approve'
                  ? `להעביר את ${confirmDialog.guestName} לאושר? יישלח מייל עם QR.`
                  : `להעביר את ${confirmDialog.guestName} לנדחה?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-sm text-sm transition"
                >
                  ביטול
                </button>
                <button
                  onClick={async () => {
                    await handleAction(confirmDialog.guestId, confirmDialog.action)
                    setConfirmDialog(null)
                  }}
                  disabled={actionLoading === confirmDialog.guestId}
                  className={`flex-1 py-2.5 rounded-sm text-sm transition disabled:opacity-50 ${
                    confirmDialog.action === 'approve'
                      ? 'bg-green-50 hover:bg-green-100 text-green-600'
                      : 'bg-red-50 hover:bg-red-100 text-red-500'
                  }`}
                >
                  {actionLoading === confirmDialog.guestId ? '...' : 'אישור'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
