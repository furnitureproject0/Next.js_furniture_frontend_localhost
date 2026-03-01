# API Base URL Migration

## تحديث الـ API Base URL

**التاريخ:** مارس 2024  
**الحالة:** ✅ مكتمل

---

## التغييرات المطبقة

### 1️⃣ تحديث `next.config.js`

**السابق:**
```javascript
const apiDestination = isDevelopment
    ? "http://localhost:5000/api/:path*"
    : "http://159.198.70.32:5000/api/:path*";
```

**الجديد:**
```javascript
destination: "https://api.angebotsprofi.ch/api/:path*"
```

✅ جميع الطلبات الآن تذهب إلى: `https://api.angebotsprofi.ch/api/`

---

### 2️⃣ تحديث `src/lib/api.js`

**الدالة `getApiBaseUrl()`:**
```javascript
const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
    // Always use production API
    return "https://api.angebotsprofi.ch/api";
};
```

✅ تمت إزالة المنطق القديم الذي يتحقق من البيئة (localhost vs production)

---

### 3️⃣ تحديث `src/hooks/useNotifications.js` (Socket.IO)

**السابق:**
```javascript
let socketUrl;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    socketUrl = 'http://localhost:5000';
} else {
    socketUrl = "http://159.198.70.32:5000";
}
```

**الجديد:**
```javascript
let socketUrl = "https://api.angebotsprofi.ch";
```

✅ Socket.IO الآن متصل بـ: `https://api.angebotsprofi.ch` للبث الفوري

---

### 4️⃣ تحديث التعليقات التوثيقية

| الملف | التغيير |
|------|--------|
| `src/lib/services/superAdminService.js` | Base URL: `https://api.angebotsprofi.ch/api` |
| `ORDERS_TAB_FIX.md` | Backend API: `https://api.angebotsprofi.ch/api` |

---

## الملفات المعدلة

```
✅ next.config.js                          (rewrites configuration)
✅ src/lib/api.js                          (API base URL logic)
✅ src/hooks/useNotifications.js           (Socket.IO URL)
✅ src/lib/services/superAdminService.js   (documentation)
✅ ORDERS_TAB_FIX.md                       (documentation)
```

---

## خريطة الطلبات

### API Requests
```
Frontend (/api/orders-v2)
    ↓ (Next.js Proxy)
https://api.angebotsprofi.ch/api/orders-v2
    ↓
Backend API Server
```

### Real-time (Socket.IO)
```
Frontend
    ↓ (WebSocket)
https://api.angebotsprofi.ch (default port 443 with upgrade to WSS)
    ↓
Backend Socket.IO
```

---

## ملاحظات البيئة

### متغيرات البيئة المدعومة

إذا كنت تريد تجاوز الـ URL الافتراضي، استخدم:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-custom-api.com/api
```

---

## اختبار الاتصال

### 1. اختبر API Requests
```
1. افتح DevTools (F12)
2. انقر على Network tab
3. قم بأي عملية في التطبيق
4. تحقق من الطلبات تذهب إلى:
   https://api.angebotsprofi.ch/api/**
```

### 2. اختبر WebSocket
```
1. افتح DevTools Console
2. ابحث عن رسائل Socket.IO
3. تحقق من الاتصال في:
   https://api.angebotsprofi.ch:443
```

---

## Troubleshooting

### إذا ظهرت أخطاء CORS

✅ تأكد أن الخادم `https://api.angebotsprofi.ch` يسمح بـ:
- Origin: application domain
- Methods: GET, POST, PATCH, DELETE, PUT, OPTIONS
- Headers: Content-Type, Authorization, etc.

### إذا لم يتصل Socket.IO

✅ تأكد أن الخادم يدعم:
- WebSocket upgrade
- TLS/SSL (HTTPS)
- Port 443 or reverse proxy configuration

### إذا أردت العودة للـ localhost

✅ عدّل `next.config.js` و `src/lib/api.js` مرة أخرى:
```javascript
// next.config.js
destination: "http://localhost:5000/api/:path*"

// src/lib/api.js
return "http://localhost:5000/api";
```

---

## ملخص سريع

| النقطة | الحالة |
|--------|--------|
| API Base URL | ✅ `https://api.angebotsprofi.ch/api` |
| Socket.IO URL | ✅ `https://api.angebotsprofi.ch` |
| Proxy Configuration | ✅ محدث |
| Environment Detection | ✅ موحد |
| Production Ready | ✅ نعم |

---

**الحالة:** جاهز للإنتاج ✅
