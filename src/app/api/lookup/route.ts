import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrToken } = body

    if (!qrToken) {
      return NextResponse.json(
        { error: 'קוד QR חסר' },
        { status: 400 }
      )
    }

    // Find guest by QR token
    const { data: guest, error: fetchError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('qr_token', qrToken)
      .single()

    if (fetchError || !guest) {
      return NextResponse.json({
        error: '❌ קוד לא תקין',
      })
    }

    return NextResponse.json({
      guest: {
        name: guest.name,
        guestCount: guest.guest_count,
        status: guest.status,
        checkedIn: guest.checked_in,
      },
    })
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשרת' },
      { status: 500 }
    )
  }
}
