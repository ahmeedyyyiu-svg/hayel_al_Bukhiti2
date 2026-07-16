class ContactModel {
  final int? id;
  final String name;
  final String phone;

  ContactModel({this.id, required this.name, required this.phone});

  // تحويل البيانات إلى شكل يفهمه جدول قاعدة البيانات
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
    };
  }
}
