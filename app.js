// واجهة التطبيق: كل شيء يعمل محليًا (localStorage) بدون أي طلبات شبكة،
// حتى يعمل التطبيق بدون اتصال بالإنترنت داخل تطبيق أندرويد المُعبّأ.
const contactsList = document.getElementById("contacts-list");
const contactsEmpty = document.getElementById("contacts-empty");
const contactsCount = document.getElementById("contacts-count");

const addForm = document.getElementById("add-contact-form");
const addMessage = document.getElementById("add-contact-message");
const contactCategorySelect = document.getElementById("contact-category");

const importForm = document.getElementById("import-form");
const importMessage = document.getElementById("import-message");
const importCategorySelect = document.getElementById("import-category");

const addCategoryForm = document.getElementById("add-category-form");
const categoryNameInput = document.getElementById("category-name");
const categoryMessage = document.getElementById("category-message");
const categoriesList = document.getElementById("categories-list");
const categoryTabs = document.getElementById("category-tabs");

const selectAllCheckbox = document.getElementById("select-all");
const deleteAllBtn = document.getElementById("delete-all-btn");
const bulkMessageInput = document.getElementById("bulk-message");
const sendBulkBtn = document.getElementById("send-bulk-btn");
const cancelSendBtn = document.getElementById("cancel-send-btn");
const sendSummary = document.getElementById("send-summary");
const sendStatusList = document.getElementById("send-status-list");

function setMessage(el, text, type) {
  el.textContent = text;
  el.className = "message" + (type ? ` ${type}` : "");
}

let latestContacts = [];
let latestCategories = [];
let activeCategoryFilter = "all"; // "all" أو رقم الفئة (كنص) أو "none" لبلا فئة

function categoryName(categoryId) {
  if (categoryId == null) return null;
  const category = latestCategories.find((c) => c.id === Number(categoryId));
  return category ? category.name : null;
}

// يملأ قوائم اختيار الفئة (في نموذج الإضافة والاستيراد) بالفئات الحالية.
function fillCategorySelect(select) {
  const previousValue = select.value;
  select.innerHTML = '<option value="">بلا فئة</option>';
  for (const category of latestCategories) {
    const option = document.createElement("option");
    option.value = String(category.id);
    option.textContent = category.name;
    select.appendChild(option);
  }
  if ([...select.options].some((o) => o.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderCategoryManageList() {
  categoriesList.innerHTML = "";
  for (const category of latestCategories) {
    const li = document.createElement("li");
    li.className = "category-manage-item";
    li.innerHTML = `
      <span class="category-manage-name"></span>
      <button class="delete-btn" data-id="${category.id}">حذف</button>
    `;
    li.querySelector(".category-manage-name").textContent = category.name;
    categoriesList.appendChild(li);
  }
}

// يعرض أشرطة تبويب للتصفية بحسب الفئة: الكل، كل فئة على حدة، وبلا فئة.
function renderCategoryTabs() {
  categoryTabs.innerHTML = "";
  const tabs = [
    { key: "all", label: "الكل" },
    ...latestCategories.map((c) => ({ key: String(c.id), label: c.name })),
    { key: "none", label: "بلا فئة" },
  ];
  for (const tab of tabs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-tab" + (activeCategoryFilter === tab.key ? " active" : "");
    btn.textContent = tab.label;
    btn.dataset.key = tab.key;
    categoryTabs.appendChild(btn);
  }
}

function loadCategories() {
  latestCategories = CategoriesStore.getAll();
  renderCategoryManageList();
  renderCategoryTabs();
  fillCategorySelect(contactCategorySelect);
  fillCategorySelect(importCategorySelect);
}

function getFilteredContacts() {
  if (activeCategoryFilter === "all") return latestContacts;
  if (activeCategoryFilter === "none") return latestContacts.filter((c) => c.categoryId == null);
  return latestContacts.filter((c) => c.categoryId === Number(activeCategoryFilter));
}

function renderContacts(contacts) {
  latestContacts = contacts;
  const visible = getFilteredContacts();
  contactsCount.textContent = visible.length;
  contactsList.innerHTML = "";

  if (visible.length === 0) {
    contactsEmpty.style.display = "block";
    selectAllCheckbox.checked = false;
    return;
  }
  contactsEmpty.style.display = "none";

  for (const contact of visible) {
    const li = document.createElement("li");
    li.className = "contact-item";
    const catName = categoryName(contact.categoryId);
    li.innerHTML = `
      <label class="checkbox-label contact-select">
        <input type="checkbox" class="contact-checkbox" data-id="${contact.id}" />
      </label>
      <div class="contact-info">
        <span class="contact-name"></span>
        <span class="contact-phone"></span>
      </div>
      ${catName ? `<span class="contact-category-badge"></span>` : ""}
      <button class="delete-btn" data-id="${contact.id}">حذف</button>
    `;
    li.querySelector(".contact-name").textContent = contact.name;
    li.querySelector(".contact-phone").textContent = contact.phone;
    if (catName) {
      li.querySelector(".contact-category-badge").textContent = catName;
    }
    contactsList.appendChild(li);
  }
}

function loadContacts() {
  renderContacts(ContactsStore.getAll());
}

addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    CategoriesStore.addCategory(categoryNameInput.value);
  } catch (err) {
    setMessage(categoryMessage, err.message || "حدث خطأ", "error");
    return;
  }
  setMessage(categoryMessage, "تمت إضافة الفئة بنجاح!", "success");
  addCategoryForm.reset();
  loadCategories();
});

categoriesList.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  CategoriesStore.removeCategory(btn.dataset.id);
  if (activeCategoryFilter === btn.dataset.id) {
    activeCategoryFilter = "all";
  }
  loadCategories();
  loadContacts();
});

categoryTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".category-tab");
  if (!btn) return;
  activeCategoryFilter = btn.dataset.key;
  renderCategoryTabs();
  renderContacts(latestContacts);
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const categoryId = contactCategorySelect.value || null;

  try {
    ContactsStore.addContact(name, phone, categoryId);
  } catch (err) {
    setMessage(addMessage, err.message || "حدث خطأ", "error");
    return;
  }
  setMessage(addMessage, "تم حفظ جهة الاتصال بنجاح!", "success");
  addForm.reset();
  loadContacts();
});

contactsList.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  ContactsStore.removeContact(btn.dataset.id);
  loadContacts();
});

const csvFileInput = document.getElementById("csv-file");
const csvFileName = document.getElementById("csv-file-name");

csvFileInput.addEventListener("change", () => {
  csvFileName.textContent = csvFileInput.files.length
    ? csvFileInput.files[0].name
    : "لم يتم اختيار ملف";
});

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

importForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("csv-file");
  if (!fileInput.files.length) return;

  setMessage(importMessage, "جاري الاستيراد...", "");

  let rows;
  try {
    const text = await readFileAsText(fileInput.files[0]);
    rows = parseContactsCsv(text);
  } catch (err) {
    setMessage(importMessage, "تعذر قراءة ملف CSV، تأكد من صيغة الملف", "error");
    return;
  }

  if (rows.length === 0) {
    setMessage(importMessage, "الملف لا يحتوي على بيانات", "error");
    return;
  }

  const categoryId = importCategorySelect.value || null;
  const { added, skipped } = ContactsStore.importContacts(rows, categoryId);
  const parts = [`تمت إضافة ${added.length} جهة اتصال`];
  if (skipped.length > 0) {
    parts.push(`وتخطي ${skipped.length} (مكررة أو ناقصة)`);
  }
  setMessage(importMessage, parts.join(" "), "success");
  importForm.reset();
  csvFileName.textContent = "لم يتم اختيار ملف";
  loadContacts();
});

// زر "اختيار من جهات الاتصال": يفتح نافذة اختيار جهات الاتصال الأصلية في
// المتصفح/الجهاز (Contact Picker API)، ثم يستورد المُحدَّد منها بنفس آلية
// استيراد CSV (مع تخطي المكرر والناقص وربطها بالفئة المختارة).
const pickContactsBtn = document.getElementById("pick-contacts-btn");
const pickContactsMessage = document.getElementById("pick-contacts-message");

function isContactPickerSupported() {
  return !!(navigator.contacts && typeof navigator.contacts.select === "function");
}

pickContactsBtn.addEventListener("click", async () => {
  if (!isContactPickerSupported()) {
    setMessage(
      pickContactsMessage,
      "هذا المتصفح/الجهاز لا يدعم اختيار جهات الاتصال مباشرة، استخدم استيراد CSV بدلًا من ذلك",
      "error"
    );
    return;
  }

  try {
    const selected = await navigator.contacts.select(["name", "tel"], { multiple: true });
    if (!selected || selected.length === 0) {
      setMessage(pickContactsMessage, "لم يتم اختيار أي جهة اتصال", "");
      return;
    }

    const rows = [];
    for (const person of selected) {
      const name = (person.name && person.name[0]) || "";
      const phone = (person.tel && person.tel[0]) || "";
      if (name && phone) {
        rows.push({ name, phone });
      }
    }

    if (rows.length === 0) {
      setMessage(pickContactsMessage, "الجهات المختارة لا تحتوي على اسم ورقم هاتف صالحين", "error");
      return;
    }

    const categoryId = importCategorySelect.value || null;
    const { added, skipped } = ContactsStore.importContacts(rows, categoryId);
    const parts = [`تمت إضافة ${added.length} جهة اتصال`];
    if (skipped.length > 0) {
      parts.push(`وتخطي ${skipped.length} (مكررة أو ناقصة)`);
    }
    setMessage(pickContactsMessage, parts.join(" "), "success");
    loadContacts();
  } catch (err) {
    if (err && err.name === "SecurityError") {
      setMessage(pickContactsMessage, "تم إلغاء اختيار جهات الاتصال", "");
    } else {
      setMessage(pickContactsMessage, "تعذر فتح جهات الاتصال", "error");
    }
  }
});

selectAllCheckbox.addEventListener("change", () => {
  document.querySelectorAll(".contact-checkbox").forEach((cb) => {
    cb.checked = selectAllCheckbox.checked;
  });
});

deleteAllBtn.addEventListener("click", () => {
  const visible = getFilteredContacts();
  if (visible.length === 0) return;
  const confirmed = window.confirm(
    `هل تريد حذف جميع جهات الاتصال الظاهرة حاليًا؟ (${visible.length} جهة اتصال)`
  );
  if (!confirmed) return;
  ContactsStore.removeMany(visible.map((c) => c.id));
  loadContacts();
});

function getSelectedContacts() {
  const ids = Array.from(document.querySelectorAll(".contact-checkbox:checked")).map((cb) =>
    Number(cb.dataset.id)
  );
  return latestContacts.filter((c) => ids.includes(c.id));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderSendStatus(statuses) {
  sendStatusList.innerHTML = "";
  for (const s of statuses) {
    const li = document.createElement("li");
    li.className = `send-status-item send-status-${s.state}`;
    const label =
      s.state === "pending"
        ? "قيد الانتظار"
        : s.state === "sending"
        ? "جارٍ الإرسال..."
        : s.state === "sent"
        ? "تم الإرسال"
        : s.state === "cancelled"
        ? "أُلغي"
        : `فشل${s.reason ? `: ${s.reason}` : ""}`;
    li.innerHTML = `
      <span class="send-status-name"></span>
      <span class="send-status-state"></span>
    `;
    li.querySelector(".send-status-name").textContent = `${s.contact.name} (${s.contact.phone})`;
    li.querySelector(".send-status-state").textContent = label;
    sendStatusList.appendChild(li);
  }
}

// حالة الإلغاء: تُفعَّل عند الضغط على زر "إلغاء الإرسال"، ويتحقّق منها
// الحلقة قبل إرسال كل رسالة تالية فتتوقف فورًا دون إرسال البقية.
let cancelRequested = false;

// يرسل الرسالة إلى جهات الاتصال المحدّدة واحدة تلو الأخرى، بفارق ٣ ثوانٍ
// بين كل رسالة والتالية (الانتظار يبدأ بعد اكتمال إرسال الرسالة الحالية).
// الإرسال الفعلي يتم عبر smsBridge.js: يعمل فقط داخل تطبيق أندرويد
// المُعبّأ (بعد تركيب إضافة SMS أصلية)، ويظهر "غير متصل" داخل المتصفح.
async function sendBulkSequential() {
  const message = bulkMessageInput.value.trim();
  const selected = getSelectedContacts();

  if (!message) {
    setMessage(sendSummary, "يرجى كتابة نص الرسالة أولاً", "error");
    return;
  }
  if (selected.length === 0) {
    setMessage(sendSummary, "يرجى تحديد جهة اتصال واحدة على الأقل", "error");
    return;
  }

  cancelRequested = false;
  sendBulkBtn.disabled = true;
  cancelSendBtn.hidden = false;
  const statuses = selected.map((contact) => ({ contact, state: "pending" }));
  renderSendStatus(statuses);
  setMessage(sendSummary, `جارٍ الإرسال: 0 من ${statuses.length}`, "");

  let sentCount = 0;
  let failedCount = 0;
  let cancelledAt = null;

  for (let i = 0; i < statuses.length; i++) {
    if (cancelRequested) {
      cancelledAt = i;
      for (let j = i; j < statuses.length; j++) {
        statuses[j].state = "cancelled";
      }
      renderSendStatus(statuses);
      break;
    }

    statuses[i].state = "sending";
    renderSendStatus(statuses);

    try {
      const result = await sendSms(statuses[i].contact, message);
      if (result.success) {
        statuses[i].state = "sent";
        sentCount += 1;
      } else {
        statuses[i].state = "failed";
        statuses[i].reason = result.message || "خطأ غير معروف";
        failedCount += 1;
      }
    } catch (err) {
      statuses[i].state = "failed";
      statuses[i].reason = "خطأ غير متوقع أثناء الإرسال";
      failedCount += 1;
    }

    renderSendStatus(statuses);
    setMessage(
      sendSummary,
      `جارٍ الإرسال: ${i + 1} من ${statuses.length} (نجح ${sentCount}، فشل ${failedCount})`,
      ""
    );

    const isLast = i === statuses.length - 1;
    if (!isLast) {
      await sleep(3000);
    }
  }

  sendBulkBtn.disabled = false;
  cancelSendBtn.hidden = true;

  if (cancelledAt != null) {
    setMessage(
      sendSummary,
      `تم إلغاء الإرسال: نجح ${sentCount}، فشل ${failedCount}، لم يُرسل ${
        statuses.length - cancelledAt
      }`,
      "error"
    );
  } else {
    setMessage(
      sendSummary,
      `اكتمل الإرسال: نجح ${sentCount} من ${statuses.length}، فشل ${failedCount}`,
      failedCount > 0 ? "error" : "success"
    );
  }
}

sendBulkBtn.addEventListener("click", sendBulkSequential);
cancelSendBtn.addEventListener("click", () => {
  cancelRequested = true;
});

loadCategories();
loadContacts();

// تسجيل عامل الخدمة (Service Worker) ليعمل التطبيق بدون إنترنت بعد أول
// زيارة، وليصبح قابلًا للتثبيت على الهاتف من المتصفح (PWA) بانتظار بناء
// الـ APK الفعلي عبر Capacitor.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.error("تعذر تسجيل عامل الخدمة", err);
    });
  });
}
