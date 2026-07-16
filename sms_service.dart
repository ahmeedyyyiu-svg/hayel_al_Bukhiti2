import 'package:telephony/telephony.dart';

class SmsService {
  final Telephony telephony = Telephony.instance;

  // دالة لإرسال رسالة نصية إلى رقم محدد
  Future<void> sendSmsMessage(String phoneNumber, String messageText) async {
    try {
      // التأكد أولاً من أن الهاتف يمتلك صلاحية إرسال الرسائل
      bool? permissionsGranted = await telephony.requestPhoneAndSmsPermissions;

      if (permissionsGranted != null && permissionsGranted) {
        // إرسال الرسالة مباشرة عبر الشريحة
        await telephony.sendSms(
          to: phoneNumber,
          message: messageText,
        );
        print("تم إرسال الرسالة بنجاح إلى: $phoneNumber");
      } else {
        print("لم يتم إرسال الرسالة: التطبيق لا يملك صلاحية الـ SMS");
      }
    } catch (e) {
      print("حدث خطأ أثناء إرسال الرسالة: $e");
    }
  }
}
