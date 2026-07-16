# تحويل التطبيق إلى APK أندرويد (يعمل بدون إنترنت) عبر Capacitor

بناء تطبيق أندرويد يحتاج Android Studio وحزمة تطوير أندرويد (Android SDK)
وجافا (JDK)، وهذه الأدوات غير متوفرة داخل بيئة Replit. توجد طريقتان
للحصول على ملف APK:

## الطريقة الأولى (الأسهل): بناء تلقائي عبر GitHub Actions — بدون تثبيت أي شيء
تم إضافة `.github/workflows/build-apk.yml` في هذا المشروع: يبني APK تلقائيًا
في سحابة GitHub في كل مرة تُرفع فيها تعديلات، دون الحاجة لتثبيت Android
Studio على جهازك. هذا البناء يشمل الآن **إضافة إرسال SMS الأصلية جاهزة
ومُركّبة تلقائيًا** (`native-android/SmsSenderPlugin.java`)، فالـ APK الناتج
يرسل رسائل فعلية عبر شريحة SIM مباشرة — وليس نسخة تجريبية فقط.

1. تأكّد أن هذا المستودع مرتبط بـ GitHub (هذا المشروع مرتبط مسبقًا).
2. ارفع (push) آخر تعديلاتك إلى GitHub (من Replit: تبويب Git، أو راجع
   مهارة git-remote).
3. افتح مستودعك على github.com ← تبويب **Actions** ← ستجد تشغيلًا باسم
   "Build Android APK" قيد التنفيذ أو مكتمل (يستغرق عادة ٥ إلى ١٠ دقائق).
4. بعد اكتماله بنجاح (علامة ✔️ خضراء)، افتح ذلك التشغيل، وفي أسفل الصفحة
   قسم **Artifacts** ← نزّل `sms-manager-debug-apk` (يأتي كملف zip يحتوي
   على `app-debug.apk` بداخله).
5. انقل ملف APK إلى هاتفك وثبّته يدويًا (فعّل "السماح بالتثبيت من مصادر
   غير معروفة" إن طُلب منك ذلك).

> ملاحظة: هذه نسخة "Debug" غير موقّعة رسميًا — تعمل تمامًا على هاتفك
> الشخصي، لكنها غير مخصّصة للنشر على متجر Google Play (راجع الخطوة ٩
> أدناه لبناء نسخة موقّعة للنشر لاحقًا إن احتجت ذلك).

## الطريقة الثانية: البناء اليدوي على جهازك (Windows/macOS/Linux)
هذا الدليل يشرح الخطوات التي تنفّذها **خارج Replit** على جهازك.

## ملخص ما تم تجهيزه هنا في الكود

- كل منطق التطبيق (جهات الاتصال، الاستيراد من CSV، الإرسال) أصبح يعمل
  بالكامل داخل المتصفح عبر `localStorage`، بدون أي اتصال بخادم. هذا يعني
  أن التطبيق **لا يحتاج إنترنت ولا خادم Node يعمل على الهاتف** — بيانات كل
  مستخدم محفوظة محليًا على جهازه فقط.
- ملف `capacitor.config.json` جاهز في جذر المشروع، ويشير `webDir` إلى مجلد
  `public` (وهو نفسه ما يعرضه الخادم حاليًا على Replit).
- `package.json` يحتوي على حزم Capacitor الأساسية
  (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) وأوامر
  مختصرة: `npm run cap:add:android`, `npm run cap:sync`,
  `npm run cap:open:android`.
- `public/smsBridge.js` هو نقطة الوصل لإرسال الرسائل: عند التشغيل داخل
  تطبيق أندرويد الفعلي، يستدعي إضافة (Plugin) أصلية باسم `SmsSender`.
  كود هذه الإضافة موجود جاهزًا في `native-android/SmsSenderPlugin.java`
  (يرسل عبر `SmsManager` مباشرة، ويطلب إذن `SEND_SMS` وقت التشغيل تلقائيًا
  عبر نظام أذونات Capacitor). هذا الجزء تحديدًا **لا يمكن اختباره داخل
  Replit** لأنه يحتاج شريحة SIM وأذونات أندرويد حقيقية على جهاز فعلي، لكنه
  يُركَّب تلقائيًا ضمن بناء GitHub Actions (الطريقة الأولى أعلاه).

## الخطوات خارج Replit

### 1. تجهيز الأدوات (مرة واحدة على جهازك)
- ثبّت [Node.js](https://nodejs.org) (نسخة 18 أو أحدث).
- ثبّت [Android Studio](https://developer.android.com/studio) (يثبّت معه
  Android SDK تلقائيًا).
- ثبّت Java JDK 17 (Android Studio عادة يوفره ضمن إعداداته).

### 2. تنزيل المشروع من Replit
- من Replit: زر النقاط الثلاث ⋮ أعلى قائمة الملفات ← Download as zip، أو
  استخدم Git إن كان المشروع مرتبطًا بمستودع.
- فك ضغط المشروع على جهازك، وافتح طرفية (Terminal) داخل مجلده.

### 3. تثبيت الحزم
```bash
npm install
```

### 4. إضافة منصة أندرويد
```bash
npx cap add android
```
هذا ينشئ مجلد `android/` يحتوي على مشروع أندرويد أصلي كامل (Gradle).

### 5. مزامنة الملفات الثابتة مع مشروع أندرويد
كل مرة تُعدّل فيها ملفات `public/`:
```bash
npx cap sync android
```

### 6. تركيب إضافة إرسال SMS الأصلية (جاهزة في المشروع)
لا حاجة لكتابة أي كود إضافة جديد — الكود جاهز في `native-android/`. بعد
`npx cap add android`، انسخه إلى مكانه داخل مشروع أندرويد:
```bash
mkdir -p android/app/src/main/java/com/smsmanager/app
cp native-android/SmsSenderPlugin.java android/app/src/main/java/com/smsmanager/app/
cp native-android/MainActivity.java android/app/src/main/java/com/smsmanager/app/
```
هذه الإضافة (`SmsSenderPlugin.java`) تستخدم:
```java
SmsManager smsManager = SmsManager.getDefault();
smsManager.sendTextMessage(phoneNumber, null, message, null, null);
```
وترسل الرسالة مباشرة عبر شريحة SIM بدون فتح أي تطبيق آخر وبدون إنترنت، مع
طلب إذن `SEND_SMS` من المستخدم تلقائيًا عند أول إرسال (عبر نظام أذونات
Capacitor المدمج في الإضافة). `MainActivity.java` معدّل ليسجّل هذه
الإضافة عبر `registerPlugin(SmsSenderPlugin.class)`.

### 6.5 استخدام صورتك كأيقونة للتطبيق
تم وضع صورة الأيقونة المصدرية (مأخوذة من الصورة التي رفعتها) في
`resources/icon.png` (مربّعة 1024×1024) — وهي نفس الصورة المستخدَمة الآن
كأيقونة الموقع داخل معاينة Replit (`public/icons/`). لتوليد كل أحجام
أيقونة أندرويد المطلوبة (بما فيها الأيقونات التكيّفية Adaptive Icons)
تلقائيًا من هذا الملف، نفّذ على جهازك بعد `npx cap add android`:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --android
npx cap sync android
```
هذا يقرأ `resources/icon.png` (وإن أردت شاشة بدء تشغيل splash خاصة أيضًا،
أضف `resources/splash.png` بنفس الطريقة) ويولّد كل نسخ الأيقونة بالمقاسات
التي يحتاجها أندرويد داخل `android/app/src/main/res/`، بدل نسخها يدويًا.

### 7. إضافة إذن إرسال الرسائل
افتح `android/app/src/main/AndroidManifest.xml` وأضف قبل وسم `<application>`:
```xml
<uses-permission android:name="android.permission.SEND_SMS" />
```
هذا إذن "خطير" (dangerous) في أندرويد، يعني أن المستخدم يجب أن يوافق عليه
داخل التطبيق عند أول استخدام (وليس فقط عند التثبيت). أضف طلب الإذن وقت
التشغيل داخل كود الإضافة الأصلية (`ActivityCompat.requestPermissions`).

> ملاحظة مهمة: متجر Google Play يمنع نشر تطبيقات عادية تستخدم إذن
> `SEND_SMS` إلا إذا كان التطبيق هو "تطبيق الرسائل الافتراضي" على الجهاز.
> هذا القيد خاص بالنشر عبر المتجر فقط، ولا يمنعك من تثبيت الـ APK يدويًا
> (Sideloading) على هاتفك الشخصي واستخدامه بدون نشره على المتجر.

### 8. فتح المشروع في Android Studio وبناء APK
```bash
npx cap open android
```
داخل Android Studio:
- انتظر اكتمال مزامنة Gradle.
- من القائمة: Build ← Build Bundle(s) / APK(s) ← Build APK(s).
- بعد الاكتمال، ستجد ملف APK داخل
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- انسخ هذا الملف إلى هاتفك (عبر كابل USB أو رابط تنزيل) وثبّته يدويًا
  (فعّل "السماح بالتثبيت من مصادر غير معروفة" إن طُلب منك ذلك).

### 9. (اختياري) بناء نسخة موقّعة للتوزيع
إذا أردت لاحقًا نشر التطبيق على Google Play بدل التثبيت اليدوي فقط، ستحتاج
مفتاح توقيع (keystore) وبناء "Release APK / App Bundle" بدل نسخة Debug —
هذه خطوة إضافية منفصلة يوثّقها [دليل Android الرسمي لتوقيع التطبيقات](https://developer.android.com/studio/publish/app-signing).

## اختبار التطبيق بدون إنترنت
بعد التثبيت، فعّل وضع الطيران (Airplane Mode) ثم فعّل الاتصال الخلوي فقط
(بدون Wi-Fi وبدون بيانات إنترنت) وجرّب: إضافة جهة اتصال، استيراد CSV، ثم
إرسال رسالة. كل شيء ما عدا الإرسال الفعلي للـ SMS لا يحتاج أي شبكة إطلاقًا؛
إرسال الـ SMS نفسه يحتاج فقط تغطية شبكة جوال (وليس إنترنت).
