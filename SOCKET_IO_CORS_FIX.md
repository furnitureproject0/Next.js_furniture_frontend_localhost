# Socket.IO CORS Error Fix

## المشكلة / Problem

Socket.IO لا يمكنه الاتصال بسبب خطأ CORS:
```
Access-Control-Allow-Origin header has a value 'http://localhost:5173' 
that is not equal to the supplied origin 'http://localhost:3000'
```

## الحلول / Solutions

### الحل 1: تحديث إعدادات CORS في الخادم الخلفي (مُوصى به) / Update Backend CORS Settings (Recommended)

في الخادم الخلفي (Backend Server)، أضف `http://localhost:3000` إلى قائمة CORS المسموح بها:

**إذا كنت تستخدم Express.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js frontend
    'http://localhost:5173',   // Vite frontend (if you have one)
    'http://localhost:3001'   // Other frontend ports
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
```

**إذا كنت تستخدم Socket.IO:**
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

### الحل 2: استخدام Next.js Proxy (تم تطبيقه) / Using Next.js Proxy (Already Implemented)

تم إضافة proxy في `next.config.js` لـ Socket.IO. لكن Socket.IO قد لا يعمل بشكل كامل مع HTTP proxies.

**ملاحظة:** قد تحتاج إلى إعادة تشغيل Next.js dev server بعد تغيير `next.config.js`:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### الحل 3: الاتصال المباشر (يتطلب إصلاح CORS) / Direct Connection (Requires CORS Fix)

إذا أردت الاتصال المباشر، غيّر في `src/hooks/useNotifications.js`:
```javascript
// Change from:
socketUrl = window.location.origin; // Uses proxy
socketPath = '/socket.io';

// To:
socketUrl = 'http://localhost:5000'; // Direct connection
socketPath = undefined;
```

## التحقق من الحل / Verify the Fix

1. افتح Developer Console (F12)
2. ابحث عن: `✅ Connected to Socket.IO server`
3. إذا ظهر الخطأ: تحقق من إعدادات CORS في الخادم الخلفي

## ملاحظات إضافية / Additional Notes

- Socket.IO يحتاج إلى WebSocket upgrade، لذلك HTTP proxy قد لا يعمل بشكل كامل
- الحل الأفضل هو إصلاح CORS في الخادم الخلفي
- تأكد من أن الخادم الخلفي يعمل على `http://localhost:5000`

