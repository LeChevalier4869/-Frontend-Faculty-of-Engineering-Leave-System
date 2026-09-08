import dayjs from "dayjs";

// แปลงจำนวน "วัน" ของวันลาให้อ่านง่ายในรูปแบบ ปี / เดือน / วัน โดย "ยึดตามปฏิทินจริง"
// (1 ปี = 365 วัน หรือ 366 วันสำหรับปีอธิกสุรทิน, เดือนตามจำนวนวันจริง)
//
// คำนวณด้วย dayjs โดย anchor ที่ปีอธิกสุรทิน (2020-01-01) เพื่อให้ค่าที่ใช้จริงในระบบ
// ออกมาเป๊ะ เช่น 366 -> "1 ปี", 1461 -> "4 ปี", 731 -> "2 ปี"
//
// - ไม่ถึง 1 เดือน -> "X วัน"
// - ไม่ถึง 1 ปี    -> "X เดือน Y วัน"
// - เกิน 1 ปี      -> "X ปี Y เดือน Z วัน" (ตัดส่วนที่เป็น 0 ออก)
const ANCHOR = "2020-01-01"; // ปีอธิกสุรทิน

export function formatLeaveDays(value) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);

  const negative = n < 0;
  const totalDays = Math.abs(Math.round(n));
  if (totalDays === 0) return "0 วัน";

  const start = dayjs(ANCHOR);
  const end = start.add(totalDays, "day");

  const years = end.diff(start, "year");
  const afterYears = start.add(years, "year");
  const months = end.diff(afterYears, "month");
  const afterMonths = afterYears.add(months, "month");
  const days = end.diff(afterMonths, "day");

  const parts = [];
  if (years) parts.push(`${years} ปี`);
  if (months) parts.push(`${months} เดือน`);
  if (days || parts.length === 0) parts.push(`${days} วัน`);

  return (negative ? "-" : "") + parts.join(" ");
}

// เลือกหน่วยแสดงผลตามสิทธิ์รวมของประเภทการลา
// - สิทธิ์รวมเกิน 1 ปี (มากกว่า 365 วัน) → หน่วย "ปี"
// - ไม่เกิน 1 ปี → หน่วย "วัน"  (ไม่ใช้หน่วย "เดือน")
export function leaveUnitForMaxDays(maxDays) {
  return Number(maxDays) > 365 ? "year" : "day";
}

// แสดงจำนวนวันลาตามหน่วยที่กำหนด (ปี หรือ วัน) โดยไม่มีหน่วยเดือน
// หน่วย "ปี" จะแตกเป็น "X ปี Y วัน" แบบนับปีจริง (leap-aware) — เต็มปีพอดีโชว์ "X ปี",
// ถ้าไม่พอดีจะโชว์วันที่เหลือให้เห็น (เช่น 366→"1 ปี", พอหัก 1 วันเหลือ 365→"365 วัน")
export function formatLeaveDaysByUnit(value, unit = "day") {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (unit === "year") {
    const whole = Math.floor(abs);
    const frac = Math.round((abs - whole) * 10) / 10; // คงครึ่งวัน (0.5) ไว้

    const start = dayjs(ANCHOR);
    const end = start.add(whole, "day");
    const years = end.diff(start, "year");
    const days = end.diff(start.add(years, "year"), "day") + frac;

    const parts = [];
    if (years) parts.push(`${years} ปี`);
    if (days || parts.length === 0) parts.push(`${days} วัน`);
    return sign + parts.join(" ");
  }

  // หน่วยวัน — คงครึ่งวัน (0.5) ไว้
  const days = Math.round(abs * 10) / 10;
  return `${sign}${days} วัน`;
}

export default formatLeaveDays;
