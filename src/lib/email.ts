import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'in-v3.mailjet.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendConfirmationEmail(to: string, name: string) {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6B21A8 0%, #EC4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎭 מסיבת פורים</h1>
        <p style="color: #F59E0B; margin: 10px 0 0 0; font-size: 18px;">Laiysh Group</p>
      </div>
      <div style="background: #1F2937; padding: 30px; border-radius: 0 0 16px 16px; color: white;">
        <h2 style="color: #F59E0B; margin-top: 0;">היי ${name}! 👋</h2>
        <p style="font-size: 16px; line-height: 1.8;">
          קיבלנו את הבקשה שלך להצטרף למסיבת הפורים! 🎉
        </p>
        <p style="font-size: 16px; line-height: 1.8;">
          הבקשה שלך ממתינה לאישור. נשלח לך מייל נוסף עם QR code ברגע שתאושר.
        </p>
        <div style="background: #374151; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #9CA3AF;">📅 יום חמישי, 5 במרץ 2026</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">🕢 19:30</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">📍 הכישור 14, חולון</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">🚗 חניה: חניון מרכז הסיירים</p>
          <p style="margin: 10px 0 0 0; color: #EC4899;">👗 קוד לבוש: תחפושות בלבד!</p>
        </div>
        <p style="color: #9CA3AF; font-size: 14px;">
          נתראה בקרוב! 🎭✨
        </p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים 🎭" <${process.env.EMAIL_FROM}>`,
    to,
    subject: '🎭 קיבלנו את הבקשה שלך - מסיבת פורים Laiysh Group',
    html,
  })
}

export async function sendApprovalEmail(to: string, name: string, qrToken: string) {
  const qrCodeBuffer = await QRCode.toBuffer(qrToken, {
    width: 300,
    margin: 2,
    color: {
      dark: '#6B21A8',
      light: '#FFFFFF',
    },
  })

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6B21A8 0%, #EC4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎭 מסיבת פורים</h1>
        <p style="color: #F59E0B; margin: 10px 0 0 0; font-size: 18px;">Laiysh Group</p>
      </div>
      <div style="background: #1F2937; padding: 30px; border-radius: 0 0 16px 16px; color: white; text-align: center;">
        <h2 style="color: #22C55E; margin-top: 0;">✅ ${name}, אושרת!</h2>
        <p style="font-size: 18px; line-height: 1.8;">
          הבקשה שלך אושרה! נתראה במסיבה 🎉
        </p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px auto; display: inline-block;">
          <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
        </div>
        <p style="color: #F59E0B; font-size: 16px; font-weight: bold;">
          ⚠️ שמור את הקוד הזה! תצטרך להציג אותו בכניסה
        </p>
        <div style="background: #374151; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: right;">
          <p style="margin: 0; color: #9CA3AF;">📅 יום חמישי, 5 במרץ 2026</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">🕢 19:30</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">📍 הכישור 14, חולון</p>
          <p style="margin: 10px 0 0 0; color: #9CA3AF;">🚗 חניה: חניון מרכז הסיירים</p>
          <p style="margin: 10px 0 0 0; color: #EC4899;">👗 קוד לבוש: תחפושות בלבד!</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים 🎭" <${process.env.EMAIL_FROM}>`,
    to,
    subject: '✅ אושרת! הנה ה-QR שלך - מסיבת פורים Laiysh Group',
    html,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        cid: 'qrcode',
      },
    ],
  })
}

export async function sendRejectionEmail(to: string, name: string) {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6B21A8 0%, #EC4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎭 מסיבת פורים</h1>
        <p style="color: #F59E0B; margin: 10px 0 0 0; font-size: 18px;">Laiysh Group</p>
      </div>
      <div style="background: #1F2937; padding: 30px; border-radius: 0 0 16px 16px; color: white;">
        <h2 style="color: #EF4444; margin-top: 0;">היי ${name}</h2>
        <p style="font-size: 16px; line-height: 1.8;">
          לצערנו, לא נוכל לארח אותך הפעם במסיבה.
        </p>
        <p style="font-size: 16px; line-height: 1.8; color: #9CA3AF;">
          מקווים לראותך באירועים הבאים! 💜
        </p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים 🎭" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'מסיבת פורים Laiysh Group',
    html,
  })
}