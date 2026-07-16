import 'package:flutter/material.dart';
import '../services/database_helper.dart';
import '../services/sms_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();

  final DatabaseHelper _dbHelper = DatabaseHelper.instance;
  final SmsService _smsService = SmsService();

  // دالة لحفظ جهة الاتصال في قاعدة البيانات
  void _saveContact() async {
    final name = _nameController.text;
    final phone = _phoneController.text;

    if (name.isNotEmpty && phone.isNotEmpty) {
      await _dbHelper.insertContact(name, phone);
      _nameController.clear();
      _phoneController.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ جهة الاتصال بنجاح!')),
      );
    }
  }

  // دالة لإرسال الرسالة النصية للرقم المكتوب
  void _sendSms() async {
    final phone = _phoneController.text;
    final message = _messageController.text;

    if (phone.isNotEmpty && message.isNotEmpty) {
      await _smsService.sendSmsMessage(phone, message);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('جاري إرسال الرسالة النصية...')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الرسائل وقاعدة البيانات'),
        backgroundColor: Colors.blueAccent,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'إضافة جهة اتصال جديدة:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'الاسم',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'رقم الهاتف',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _saveContact,
                child: const Text('حفظ في قاعدة البيانات'),
              ),
              const Divider(height: 40, thickness: 2),
              const Text(
                'إرسال رسالة نصية SMS:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _messageController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'نص الرسالة النصية',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _sendSms,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: const Text('إرسال الرسالة الآن'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
