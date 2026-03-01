# Production Server Startup Guide

## إعدادات الخادم الإنتاجي

**التاريخ:** مارس 2024  
**الحالة:** جاهز للتشغيل ✅

---

## 🚀 بدء تشغيل الخادم الإنتاجي

### المرحلة 1: البناء (Build)

```bash
# في مجلد الفرونتند
cd Next.js_furniture_frontend_localhost

# بناء المشروع للإنتاج
npm run build

# النتيجة المتوقعة:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# Size optimizations saved X KB
```

### المرحلة 2: التشغيل

```bash
# بدء الخادم الإنتاجي
npm start

# النتيجة المتوقعة:
# ▲ Next.js 15.5.9 (production)
# - built successfully
# - ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 📋 معلومات الاتصال

### API Base URL
```
https://api.angebotsprofi.ch/api
```

### Socket.IO Connection
```
https://api.angebotsprofi.ch (WebSocket upgrade on port 443)
```

### Frontend Application
```
http://localhost:3000 (or your production domain)
```

---

## ✅ قائمة التحقق قبل التشغيل

- [ ] تم تحديث `next.config.js` بـ URL الإنتاج الصحيح
- [ ] تم تحديث `src/lib/api.js` بـ URL الإنتاجي
- [ ] تم تحديث Socket.IO URL في `src/hooks/useNotifications.js`
- [ ] تم حذف مجلد `.next` القديم (إن وجد)
- [ ] تم تشغيل `npm ci` أو `npm install` للتأكد من التبعيات
- [ ] لا توجد أخطاء في بناء المشروع (`npm run build`)
- [ ] تم اختبار الاتصال بـ API على الآلة المحلية

---

## 🔍 اختبارات ما بعد التشغيل

### 1. التحقق من الاتصال بـ API

```bash
# في terminal منفصل
curl https://api.angebotsprofi.ch/api/health

# يجب أن ترى استجابة بنجاح
```

### 2. التحقق من الواجهة الأمامية

```
افتح المتصفح: http://localhost:3000
تحقق من:
- ✅ التطبيق يحمل بدون أخطاء
- ✅ الصور والأنماط تحمل بشكل صحيح
- ✅ جميع الواجهات تعمل
```

### 3. التحقق من بيانات الطلبات

```bash
# افتح DevTools (F12) في المتصفح
# اذهب إلى Network tab
# قم بأي عملية (مثل تسجيل الدخول أو جلب الطلبات)
# تحقق من:
- ✅ جميع الطلبات تذهب إلى https://api.angebotsprofi.ch/api/**
- ✅ لا توجد أخطاء 404 أو 500
- ✅ الاستجابات لها البيانات الصحيحة
```

### 4. التحقق من WebSocket

```bash
في Console (DevTools):
- ابحث عن رسائل: "Socket connected"
- تحقق من عدم وجود أخطاء WebSocket
```

---

## 📊 معلومات الأداء

### حجم الملفات المُنتجة
```
بعد البناء، ستجد:
.next/
├── static/           (ملفات JavaScript و CSS محسّنة)
├── server/           (رمز الخادم)
└── standalone/       (إذا كان output مضبوطاً على standalone)
```

### أداء التحميل
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 3s
- Time to Interactive (TTI): < 4s

---

## 🛡️ متغيرات البيئة الموصى بها

إذا أردت تجاوز الـ URL، استخدم:

```bash
# في ملف .env.production.local أو نظام البيئة
NEXT_PUBLIC_API_BASE_URL=https://api.angebotsprofi.ch/api
NODE_ENV=production
```

---

## 🚨 مراقبة الأخطاء

### السجلات (Logs)

بعد التشغيل، ابحث عن:
```
✓ - requests completed successfully
✗ - API errors or CORS issues
⚠️ - warnings about dependencies or unused packages
```

### الأخطاء الشائعة وحلولها

| الخطأ | السبب | الحل |
|------|------|------|
| CORS Error | Backend لا يسمح بطلبات من frontend | تحقق من إعدادات CORS على الخادم |
| WebSocket Error | Socket.IO غير متصل | تحقق من `https://api.angebotsprofi.ch` يدعم WSS |
| 404 Not Found | API endpoint غير موجود | تحقق من إصدار الخادم والقاعدة البيانات |
| 500 Internal Server | خطأ في الخادم | تحقق من سجلات الخادم |

---

## 📈 توسيع الخادم

### زيادة Workers (إذا لزم الأمر)

```bash
# تشغيل مع عدد محدد من العمليات
npm start -- --max-workers=4
```

### استخدام Reverse Proxy (مثل nginx)

```nginx
upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## ✨ بعد التشغيل النجح

تهانينا! 🎉

تم تشغيل الفرونتند بنجاح مع:
- ✅ اتصال API محسّن إلى `https://api.angebotsprofi.ch/api`
- ✅ Real-time notifications عبر WebSocket
- ✅ تطبيق محسّن وجاهز للإنتاج

---

## 📞 الدعم والتواصل

للمشاكل أو الأسئلة:
1. تحقق من السجلات (logs)
2. راجع هذا الملف للمشاكل الشائعة
3. تواصل مع فريق الدعم مع السجلات

---

**النسخة:** 1.0  
**تاريخ آخر تحديث:** مارس 2024  
**الحالة:** ✅ جاهز للإنتاج
