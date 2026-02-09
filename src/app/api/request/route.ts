import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, guestCount, note } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'נא למלא את כל השדות הנדרשים' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('guests')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      const statusMessages: Record<string, string> = {
        pending: 'כבר נשלחה בקשה! היא ממתינה לאישור',
        approved: 'הבקשה כבר אושרה! בדקו את המייל',
        rejected: 'הבקשה הקודמת נדחתה',
      }
      return NextResponse.json(
        { error: statusMessages[existing.status] || 'האימייל הזה כבר קיים במערכת' },
        { status: 400 }
      )
    }

    // Generate QR token
    const qrToken = crypto.randomUUID()

    // Insert guest
    const { error: insertError } = await supabaseAdmin.from('guests').insert({
      name,
      email: email.toLowerCase(),
      phone,
      guest_count: parseInt(guestCount) || 1,
      note: note || null,
      qr_token: qrToken,
      status: 'pending',
      checked_in: false,
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'שגיאה בשמירת הנתונים' },
        { status: 500 }
      )
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(email, name)
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשרת' },
      { status: 500 }
    )
  }
}
