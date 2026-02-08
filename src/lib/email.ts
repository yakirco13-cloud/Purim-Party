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
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <p style="color: #007272; margin: 0 0 4px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">1993</p>
          <h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 4px;">LAIYSH</h1>
          <p style="color: #007272; margin: 4px 0 0 0; font-size: 13px; letter-spacing: 5px; text-transform: uppercase;">Group</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-weight: 300; font-size: 22px;">היי ${name}!</h2>
          <p style="font-size: 15px; line-height: 1.8; color: #4b5563; margin: 0 0 12px 0;">
            קיבלנו את הבקשה שלך להצטרף למסיבת הפורים!
          </p>
          <p style="font-size: 15px; line-height: 1.8; color: #4b5563; margin: 0 0 20px 0;">
            הבקשה שלך ממתינה לאישור. נשלח לך מייל נוסף עם QR code ברגע שתאושר.
          </p>
          <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0;">
            פרטים מלאים על האירוע ישלחו אליך עם האישור.
          </p>
        </div>
        <div style="padding: 16px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">לבירורים ניתן לפנות לאיציק 050-202-2222 או לאריק 054-524-3335</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים - Laiysh Group" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'קיבלנו את הבקשה שלך - מסיבת פורים Laiysh Group',
    html,
  })
}

export async function sendApprovalEmail(to: string, name: string, qrToken: string) {
  const qrCodeBuffer = await QRCode.toBuffer(qrToken, {
    width: 300,
    margin: 2,
    color: {
      dark: '#007272',
      light: '#FFFFFF',
    },
  })

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <p style="color: #007272; margin: 0 0 4px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">1993</p>
          <h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 4px;">LAIYSH</h1>
          <p style="color: #007272; margin: 4px 0 0 0; font-size: 13px; letter-spacing: 5px; text-transform: uppercase;">Group</p>
        </div>
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #007272; margin: 0 0 16px 0; font-weight: 400; font-size: 22px;">${name}, אושרת!</h2>
          <p style="font-size: 16px; line-height: 1.8; color: #4b5563; margin: 0 0 20px 0;">
            הבקשה שלך אושרה! נתראה במסיבה
          </p>
          <div style="background: #f9fafb; padding: 24px; border-radius: 4px; margin: 20px auto; display: inline-block; border: 1px solid #e5e7eb;">
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
          </div>
          <p style="color: #b45309; font-size: 14px; font-weight: bold; margin: 16px 0;">
            ⚠️ שמור את הקוד הזה! תצטרך להציג אותו בכניסה
          </p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: right;">
            <p style="margin: 0; color: #374151; font-size: 14px;">📅 יום חמישי, 5 במרץ 2026</p>
            <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">🕢 19:30</p>
            <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">📍 הכישור 14, חולון</p>
            <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">🚗 חניה: חניון מרכז הסיירים</p>
            <p style="margin: 10px 0 0 0; color: #007272; font-size: 14px; font-weight: bold;">🎭 קוד לבוש: תחפושות בלבד</p>
          </div>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 4px; margin: 20px 0 0 0; text-align: center;">
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.8;">
              נרשמתם ובסוף לא מסתדר לכם להגיע? הכל בסדר!<br/>נשמח אם תעדכנו אותנו 💙
            </p>
          </div>
        </div>
        <div style="padding: 16px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">לבירורים ניתן לפנות לאיציק 050-202-2222 או לאריק 054-524-3335</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים - Laiysh Group" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'אושרת! הנה ה-QR שלך - מסיבת פורים Laiysh Group',
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
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <p style="color: #007272; margin: 0 0 4px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">1993</p>
          <h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 4px;">LAIYSH</h1>
          <p style="color: #007272; margin: 4px 0 0 0; font-size: 13px; letter-spacing: 5px; text-transform: uppercase;">Group</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #111827; margin: 0 0 16px 0; font-weight: 300; font-size: 22px;">היי ${name}</h2>
          <p style="font-size: 15px; line-height: 1.8; color: #4b5563; margin: 0 0 12px 0;">
            לצערנו, לא נוכל לארח אותך הפעם במסיבה.
          </p>
          <p style="font-size: 15px; line-height: 1.8; color: #9ca3af; margin: 0;">
            מקווים לראותך באירועים הבאים!
          </p>
        </div>
        <div style="padding: 16px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">לבירורים ניתן לפנות לאיציק 050-202-2222 או לאריק 054-524-3335</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"מסיבת פורים - Laiysh Group" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'מסיבת פורים - Laiysh Group',
    html,
  })
}
