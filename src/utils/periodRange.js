// ตัวช่วยกรองข้อมูลตามช่วงเวลา (สัปดาห์ / เดือน / ปีงบประมาณ / ทั้งหมด)
// ใช้ร่วมกันหลาย dashboard เพื่อให้พฤติกรรมเหมือนกัน

export const PERIOD_OPTIONS = [
  { key: "week", label: "สัปดาห์นี้" },
  { key: "month", label: "เดือนนี้" },
  { key: "fiscal", label: "ปีงบประมาณ" },
  { key: "all", label: "ทั้งหมด" },
];

export const DEFAULT_PERIOD = "fiscal";

/**
 * คืนช่วงเวลาแบบ [start, end) (end เป็น exclusive)
 * - week: จันทร์–อาทิตย์ ของสัปดาห์ปัจจุบัน
 * - month: เดือนปฏิทินปัจจุบัน
 * - fiscal: ปีงบประมาณ 1 ต.ค. – 30 ก.ย. (เริ่ม 1 ต.ค. ตรงกับ logic ฝั่ง backend)
 * - อื่น ๆ / all: คืน null = ไม่กรอง
 */
export function getPeriodRange(period, now = new Date()) {
  const d0 = (y, m, d) => new Date(y, m, d);
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();

  if (period === "week") {
    const sinceMon = (now.getDay() + 6) % 7; // 0=อาทิตย์ → 6, 1=จันทร์ → 0
    const start = d0(y, m, day - sinceMon);
    const end = d0(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    return { start, end };
  }
  if (period === "month") {
    return { start: d0(y, m, 1), end: d0(y, m + 1, 1) };
  }
  if (period === "fiscal") {
    // ปีงบเริ่ม 1 ต.ค. (เดือน index 9) — ถ้าตอนนี้ >= ต.ค. ปีงบเริ่มปีนี้ ไม่งั้นปีก่อน
    const startYear = m >= 9 ? y : y - 1;
    return { start: d0(startYear, 9, 1), end: d0(startYear + 1, 9, 1) };
  }
  return null; // all
}

// ป้ายช่วงเวลาแบบไทย เช่น "1 ต.ค. 2568 – 30 ก.ย. 2569"
export function formatPeriodRangeLabel(range) {
  if (!range) return "ทุกช่วงเวลา";
  const fmt = (d) =>
    d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const lastDay = new Date(range.end.getTime() - 86400000); // end เป็น exclusive → -1 วัน
  return `${fmt(range.start)} – ${fmt(lastDay)}`;
}

/**
 * กรองรายการตามช่วงเวลา — ใช้ dateKey ก่อน (เช่น startDate ของใบลา)
 * ถ้าไม่มีค่อยใช้ fallbackKey (เช่น createdAt)
 */
export function filterByPeriod(items, period, dateKey = "startDate", fallbackKey = "createdAt") {
  const range = getPeriodRange(period);
  if (!range) return items;
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  return items.filter((r) => {
    const raw = r[dateKey] || r[fallbackKey];
    if (!raw) return false;
    const t = new Date(raw).getTime();
    return !Number.isNaN(t) && t >= startMs && t < endMs;
  });
}
