// خادم بسيط لخدمة الملفات الثابتة فقط (HTML/CSS/JS)، يُستخدم للمعاينة أثناء
// التطوير على Replit. كل منطق التطبيق (جهات الاتصال، الاستيراد، الإرسال)
// أصبح يعمل بالكامل داخل المتصفح (public/*.js) عبر localStorage، بلا أي
// اعتماد على هذا الخادم، حتى يعمل التطبيق بدون إنترنت عند تعبئته كتطبيق
// أندرويد عبر Capacitor (الذي لا يشغّل خادم Node على الجهاز).
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SMS Manager web app listening on port ${PORT}`);
});
