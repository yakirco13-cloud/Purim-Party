import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrToken, guestCount } = body

    if (!qrToken) {
      return NextResponse.json(
        { error: 'קוד QR חסר', valid: false },
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
        valid: false,
        error: '❌ קוד לא תקין',
      })
    }

    if (guest.status !== 'approved') {
      return NextResponse.json({
        valid: false,
        error: '❌ האורח לא אושר',
        guest: { name: guest.name },
      })
    }

    if (guest.checked_in) {
      return NextResponse.json({
        valid: false,
        error: '⚠️ האורח כבר נכנס',
        guest: {
          name: guest.name,
          guestCount: guest.guest_count,
          checkedInAt: guest.checked_in_at,
        },
      })
    }

    // Mark as checked in (update guest count if admin adjusted it)
    const updateData: Record<string, unknown> = {
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    }
    if (guestCount && guestCount !== guest.guest_count) {
      updateData.guest_count = guestCount
    }
    const { error: updateError } = await supabaseAdmin
      .from('guests')
      .update(updateData)
      .eq('id', guest.id)

    if (updateError) {
      console.error('Check-in error:', updateError)
      return NextResponse.json(
        { error: 'שגיאה בצ׳ק-אין', valid: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      valid: true,
      guest: {
        name: guest.name,
        guestCount: guestCount || guest.guest_count,
      },
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשרת', valid: false },
      { status: 500 }
    )
  }
}
