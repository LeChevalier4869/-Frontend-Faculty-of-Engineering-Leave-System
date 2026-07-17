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

export default formatLeaveDays;
