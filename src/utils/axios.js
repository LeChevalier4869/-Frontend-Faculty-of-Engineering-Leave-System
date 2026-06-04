// DEPRECATED: ไฟล์นี้เคยสร้าง axios instance ตัวที่สอง (พร้อม refresh ที่ทำงานไม่ได้
// เพราะเก็บ token ไว้ในตัวแปร memory ที่ไม่เคยถูกตั้งค่า)
// ปัจจุบันรวมมาใช้ instance เดียวกับ utils/api.js เพื่อให้พฤติกรรม (แนบ token / จัดการ 401)
// สอดคล้องกันทั้งระบบ — โค้ดเดิมที่ import จากไฟล์นี้ยังใช้งานได้ตามปกติ
import { API } from "./api";

// คงไว้เพื่อความเข้ากันได้กับโค้ดเดิม (no-op — token อ่านจาก localStorage ผ่าน interceptor แล้ว)
export function setTokens() {}

export default API;
