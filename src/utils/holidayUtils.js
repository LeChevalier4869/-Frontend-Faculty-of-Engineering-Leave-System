import dayjs from "dayjs";

/**
 * ขยายวันหยุดแบบ recurring ให้ครอบคลุมปีที่กำหนด
 *
 * - วันหยุดปกติ (isRecurring = false เช่น วันจันทรคติ): คงวันที่เดิม
 * - วันหยุด recurring (isRecurring = true เช่น วันขึ้นปีใหม่/วันจักรี): สร้างรายการของแต่ละปี
 *   ตามเดือน/วันเดิม เพื่อให้โผล่ทุกปีโดยแอดมินไม่ต้องกรอกซ้ำ
 * - กันซ้ำ: ถ้ามีวันหยุดที่กรอกไว้จริง (explicit) ในวันนั้นแล้ว จะไม่สร้างซ้ำ
 *   (รายการที่แอดมินกรอกถือเป็น source of truth ของวันนั้น)
 * - ตรวจวันที่ให้ถูกต้อง (เช่น 29 ก.พ. จะข้ามปีที่ไม่ใช่อธิกสุรทิน)
 *
 * @param {Array} holidays รายการวันหยุดดิบจาก API (มี date, isRecurring, ...)
 * @param {number[]} years ปี ค.ศ. ที่ต้องการให้ recurring ปรากฏ เช่น [2025, 2026, 2027]
 * @returns {Array} วันหยุดทั้งหมด โดยแต่ละรายการมี field `_date` = "YYYY-MM-DD" (local)
 */
export function expandHolidays(holidays = [], years = []) {
  const result = [];
  const occupied = new Set(); // "YYYY-MM-DD" ที่ถูกใช้ไปแล้ว

  // 1) รายการที่กรอกไว้จริงทั้งหมด (explicit) — ใส่ก่อนเสมอ
  holidays.forEach((h) => {
    const key = dayjs(h.date).format("YYYY-MM-DD");
    occupied.add(key);
    result.push({ ...h, _date: key });
  });

  // 2) ขยาย recurring ไปยังปีเป้าหมาย (ข้ามถ้าซ้ำกับ explicit หรือซ้ำกันเอง)
  holidays
    .filter((h) => h.isRecurring)
    .forEach((h) => {
      const mmdd = dayjs(h.date).format("MM-DD");
      years.forEach((y) => {
        const key = `${y}-${mmdd}`;
        // กันวันที่ไม่ถูกต้อง เช่น 2027-02-29
        if (dayjs(key).format("YYYY-MM-DD") !== key) return;
        if (occupied.has(key)) return;
        occupied.add(key);
        result.push({ ...h, _date: key });
      });
    });

  return result;
}

/**
 * ช่วงปีรอบ ๆ ปีปัจจุบันสำหรับใช้ขยาย recurring (ปีที่แล้ว .. อีก 2 ปีข้างหน้า)
 */
export function defaultHolidayYears() {
  const y = new Date().getFullYear();
  return [y - 1, y, y + 1, y + 2];
}
