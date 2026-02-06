import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, action } = body

    if (!guestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'פרמטרים חסרים' },
        { status: 400 }
      )
    }

    // Get guest
    const { data: guest, error: fetchError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .single()

    if (fetchError || !guest) {
      return NextResponse.json(
        { error: 'אורח לא נמצא' },
        { status: 404 }
      )
    }

    // Update status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error: updateError } = await supabaseAdmin
      .from('guests')
      .update({ status: newStatus })
      .eq('id', guestId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'שגיאה בעדכון הסטטוס' },
        { status: 500 }
      )
    }

    // Send email
    try {
      if (action === 'approve') {
        await sendApprovalEmail(guest.email, guest.name, guest.qr_token)
      } else {
        await sendRejectionEmail(guest.email, guest.name)
      }
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשרת' },
      { status: 500 }
    )
  }
}
