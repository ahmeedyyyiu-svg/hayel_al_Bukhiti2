// جسر إرسال الرسائل النصية.
//
// - داخل المتصفح (مثل معاينة Replit): لا توجد واجهة أصلية لإرسال SMS،
//   فتُعاد رسالة فشل واضحة السبب دون أي تظاهر بالنجاح.
// - داخل تطبيق أندرويد مُعبّأ عبر Capacitor: يحاول استدعاء إضافة (Plugin)
//   أصلية مُسجّلة باسم PLUGIN_NAME لإرسال الرسالة فعليًا عبر شبكة الجوال
//   (لا تحتاج إنترنت، فقط تغطية شبكة اتصال وشريحة SIM).
//
// راجع docs/BUILD_APK_AR.md لخطوات تركيب إضافة SMS أصلية مناسبة، أو كتابة
// إضافة Capacitor بسيطة خاصة بك إن أردت تحكمًا كاملاً بالسلوك.
const PLUGIN_NAME = "SmsSender";

function isNativeApp() {
  return Boolean(
    window.Capacitor &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()
  );
}

async function sendSms(contact, message) {
  if (!isNativeApp()) {
    return {
      success: false,
      reason: "NOT_CONNECTED",
      message:
        "الإرسال الفعلي يعمل فقط داخل تطبيق أندرويد المُعبّأ (APK)، وليس داخل المتصفح.",
    };
  }

  const plugin = window.Capacitor.Plugins && window.Capacitor.Plugins[PLUGIN_NAME];
  if (!plugin || typeof plugin.send !== "function") {
    return {
      success: false,
      reason: "PLUGIN_NOT_INSTALLED",
      message: `لم يتم تركيب إضافة إرسال الرسائل الأصلية (${PLUGIN_NAME}) بعد. راجع docs/BUILD_APK_AR.md.`,
    };
  }

  try {
    await plugin.send({ phone: contact.phone, message });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      reason: "SEND_FAILED",
      message: err && err.message ? err.message : "فشل إرسال الرسالة لسبب غير معروف",
    };
  }
}

window.sendSms = sendSms;
