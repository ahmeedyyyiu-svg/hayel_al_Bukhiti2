// يحلّل نص CSV إلى مصفوفة { name, phone } داخل المتصفح مباشرة (بدون
// الاعتماد على مكتبة على الخادم)، حتى يعمل الاستيراد بدون اتصال بالإنترنت.
// نسخة مبسّطة: لا تدعم الفواصل الموجودة داخل حقل مقتبس بعلامات ("").

const NAME_KEYS = ["name", "الاسم", "اسم"];
const PHONE_KEYS = ["phone", "number", "رقم الهاتف", "الهاتف", "رقم"];

function normalizeKey(key) {
  return String(key || "").trim().toLowerCase();
}

function splitCsvLine(line) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function parseContactsCsv(csvText) {
  const lines = String(csvText || "")
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const records = lines.map(splitCsvLine);
  const headerRow = records[0].map(normalizeKey);
  const nameIndex = headerRow.findIndex((h) => NAME_KEYS.includes(h));
  const phoneIndex = headerRow.findIndex((h) => PHONE_KEYS.includes(h));

  const hasHeader = nameIndex !== -1 || phoneIndex !== -1;
  const dataRows = hasHeader ? records.slice(1) : records;
  const resolvedNameIndex = nameIndex !== -1 ? nameIndex : 0;
  const resolvedPhoneIndex = phoneIndex !== -1 ? phoneIndex : 1;

  return dataRows.map((row) => ({
    name: row[resolvedNameIndex] || "",
    phone: row[resolvedPhoneIndex] || "",
  }));
}

window.parseContactsCsv = parseContactsCsv;
