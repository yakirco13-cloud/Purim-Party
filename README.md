# 🎭 מסיבת פורים - Laiysh Group

מערכת RSVP למסיבת פורים עם אישור אורחים וסריקת QR.

## 🚀 התקנה מהירה (15 דקות)

### 1. Supabase

1. צור פרויקט חדש ב-[Supabase](https://supabase.com) (בארגון חינמי)
2. לך ל-**SQL Editor** והרץ את הקובץ `supabase-setup.sql`
3. לך ל-**Authentication > Users** וצור משתמש אדמין (Add user > Create new user)
4. העתק את ה-URL וה-Keys מ-**Settings > API**

### 2. Vercel Deploy

1. העלה את הפרויקט ל-GitHub
2. לך ל-[Vercel](https://vercel.com) ולחץ **Import Project**
3. הוסף את משתני הסביבה הבאים:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=ticketsforparty@outlook.com
SMTP_PASS=xyzmytdhnrtazkho
EMAIL_FROM=ticketsforparty@outlook.com
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

4. לחץ **Deploy**

### 3. סיימת! 🎉

- `https://your-domain.vercel.app/` - טופס הרשמה לאורחים
- `https://your-domain.vercel.app/admin` - לוח בקרה
- `https://your-domain.vercel.app/admin/scan` - סריקת QR בכניסה

---

## 📧 על המיילים

המיילים נשלחים דרך Outlook SMTP מהכתובת `ticketsforparty@outlook.com`.

- מייל אישור נשלח ברגע ששולחים בקשה
- מייל עם QR code נשלח כשמאשרים אורח
- מייל דחייה נשלח כשדוחים אורח

## 🎫 פרטי האירוע

- **תאריך:** יום חמישי, 5 במרץ 2026
- **שעה:** 19:30
- **מיקום:** הכישור 14, חולון
- **חניה:** חניון מרכז הסיירים
- **דרס קוד:** תחפושות בלבד! 🎭

---

פורים שמח! 🎭✨
