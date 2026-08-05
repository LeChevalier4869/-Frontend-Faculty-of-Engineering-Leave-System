import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

/**
 * สีของแต่ละประเภทวัน — ใช้ไอคอน + ข้อความ + ตัวเลขควบคู่เสมอ
 * เพื่อไม่ให้พึ่งพาสีอย่างเดียวในการสื่อความหมาย
 *
 * ใช้ร่วมกันโดย MonthlyReportTable.jsx และ SymbolMeaningModal.jsx
 * (แยกออกมาจาก attendance-report-v2.jsx เพื่อไม่ให้ต้องนิยามซ้ำในแต่ละไฟล์)
 */
export const LEAVE_META = {
  PRESENT: {
    label: "มาปฏิบัติราชการ",
    symbol: "✓",
    color: "#059669",
    Icon: CheckCircle2,
    desc: "เจ้าหน้าที่มาปฏิบัติราชการตามปกติในวันดังกล่าว",
  },
  ANNUAL: {
    label: "ลาพักผ่อน",
    symbol: "ล",
    color: "#2563eb",
    Icon: CalendarDays,
    desc: "ใช้สิทธิ์ลาพักผ่อนประจำปีตามระเบียบ",
  },
  SICK: {
    label: "ลาป่วย",
    symbol: "ป",
    color: "#d97706",
    Icon: AlertTriangle,
    desc: "ลาป่วยตามใบรับรองแพทย์หรือการแจ้งลาป่วย",
  },
  PERSONAL: {
    label: "ลากิจ",
    symbol: "ก",
    color: "#7c3aed",
    Icon: FileText,
    desc: "ลากิจส่วนตัวตามที่ได้รับอนุมัติ",
  },
  ABSENT: {
    label: "ขาดราชการ",
    symbol: "ข",
    color: "#e11d48",
    Icon: XCircle,
    desc: "ไม่มาปฏิบัติราชการโดยไม่มีการลาที่ได้รับอนุมัติ",
  },
};

export const WEEKEND_META = {
  label: "วันหยุดราชการ",
  symbol: "-",
  color: "#94a3b8",
  Icon: Clock,
  desc: "วันหยุดราชการประจำสัปดาห์ ไม่นับเป็นวันทำการ",
};

export const LEAVE_ORDER = ["PRESENT", "ANNUAL", "SICK", "PERSONAL", "ABSENT"];

export const SYMBOL_TO_KEY = {
  "✓": "PRESENT",
  ล: "ANNUAL",
  ป: "SICK",
  ก: "PERSONAL",
  ข: "ABSENT",
};