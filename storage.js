// تخزين جهات الاتصال محليًا على الجهاز نفسه (localStorage) بدل الاعتماد على
// خادم بعيد. هذا ما يجعل التطبيق يعمل بالكامل بدون اتصال بالإنترنت
// (Offline) عند تعبئته كتطبيق أندرويد عبر Capacitor، وأيضًا يعمل بنفس
// الطريقة هنا داخل معاينة Replit للاختبار.

const STORAGE_KEY = "smsManagerContacts";
const CATEGORIES_KEY = "smsManagerCategories";

// الفئات الافتراضية التي تُنشأ تلقائيًا أول مرة فقط. يمكن للمستخدم إضافة
// فئات أخرى بالاسم الذي يريده من واجهة التطبيق.
const DEFAULT_CATEGORIES = ["العائلة", "الصحة", "التربية", "العاملين"];

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("تعذرت قراءة جهات الاتصال المخزّنة محليًا", err);
    return [];
  }
}

function writeAll(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function nextId(contacts) {
  return contacts.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function readCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("تعذرت قراءة الفئات المخزّنة محليًا", err);
  }
  const seeded = DEFAULT_CATEGORIES.map((name, i) => ({ id: i + 1, name }));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function nextCategoryId(categories) {
  return categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

const CategoriesStore = {
  getAll() {
    return readCategories().sort((a, b) => a.id - b.id);
  },

  // يضيف فئة جديدة باسم من اختيار المستخدم (مثل: أصدقاء، عمل، ...).
  addCategory(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      const err = new Error("يرجى كتابة اسم الفئة");
      err.code = "EMPTY_NAME";
      throw err;
    }
    const categories = readCategories();
    if (categories.some((c) => c.name === trimmed)) {
      const err = new Error("هذه الفئة موجودة مسبقًا");
      err.code = "DUPLICATE";
      throw err;
    }
    const category = { id: nextCategoryId(categories), name: trimmed };
    categories.push(category);
    writeCategories(categories);
    return category;
  },

  // يحذف فئة، وينقل جهات الاتصال التابعة لها إلى "بلا فئة" (null) بدل حذفها.
  removeCategory(id) {
    const targetId = Number(id);
    const categories = readCategories();
    const index = categories.findIndex((c) => c.id === targetId);
    if (index === -1) return false;
    categories.splice(index, 1);
    writeCategories(categories);

    const contacts = readAll();
    let changed = false;
    for (const contact of contacts) {
      if (contact.categoryId === targetId) {
        contact.categoryId = null;
        changed = true;
      }
    }
    if (changed) writeAll(contacts);
    return true;
  },
};

const ContactsStore = {
  getAll() {
    return readAll().sort((a, b) => a.id - b.id);
  },

  addContact(name, phone, categoryId) {
    const contacts = readAll();
    const trimmedPhone = normalizePhone(phone);
    if (contacts.some((c) => c.phone === trimmedPhone)) {
      const err = new Error("رقم الهاتف موجود مسبقًا");
      err.code = "DUPLICATE";
      throw err;
    }
    const contact = {
      id: nextId(contacts),
      name: String(name).trim(),
      phone: trimmedPhone,
      categoryId: categoryId != null ? Number(categoryId) : null,
      createdAt: new Date().toISOString(),
    };
    contacts.push(contact);
    writeAll(contacts);
    return contact;
  },

  // يستورد مجموعة صفوف { name, phone }، إلى فئة واحدة يحدّدها المستخدم قبل
  // الاستيراد، ويتخطى المكرر أو الناقص منها.
  importContacts(rows, categoryId) {
    const contacts = readAll();
    const existingPhones = new Set(contacts.map((c) => c.phone));
    let counter = nextId(contacts);
    const added = [];
    const skipped = [];
    const resolvedCategoryId = categoryId != null ? Number(categoryId) : null;

    for (const row of rows) {
      const name = String(row.name || "").trim();
      const phone = normalizePhone(row.phone);
      if (!name || !phone || existingPhones.has(phone)) {
        skipped.push(row);
        continue;
      }
      const contact = {
        id: counter++,
        name,
        phone,
        categoryId: resolvedCategoryId,
        createdAt: new Date().toISOString(),
      };
      contacts.push(contact);
      existingPhones.add(phone);
      added.push(contact);
    }

    writeAll(contacts);
    return { added, skipped };
  },

  removeContact(id) {
    const contacts = readAll();
    const targetId = Number(id);
    const index = contacts.findIndex((c) => c.id === targetId);
    if (index === -1) return false;
    contacts.splice(index, 1);
    writeAll(contacts);
    return true;
  },

  // يحذف كل جهات الاتصال التي تكون مُعرّفاتها ضمن القائمة المُعطاة.
  removeMany(ids) {
    const idSet = new Set(ids.map((id) => Number(id)));
    const contacts = readAll();
    const remaining = contacts.filter((c) => !idSet.has(c.id));
    const removedCount = contacts.length - remaining.length;
    writeAll(remaining);
    return removedCount;
  },
};

window.ContactsStore = ContactsStore;
window.CategoriesStore = CategoriesStore;
