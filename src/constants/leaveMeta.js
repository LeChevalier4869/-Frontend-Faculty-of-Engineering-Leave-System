import {
  CheckCircle2,
  Stethoscope,
  UserRound,
  Palmtree,
  Baby,
  GraduationCap,
  Accessibility,
  HandHeart,
  Globe2,
  Heart,
  Moon,
  Plane,
  ShieldCheck,
  CircleX,
} from "lucide-react";

/**
 * สัญลักษณ์การมาปฏิบัติงาน / การลา
 *
 * key = ค่าที่มาจาก API
 * symbol = สัญลักษณ์ที่แสดงในตาราง
 */
export const ATTENDANCE_SYMBOL = {
  PRESENT: "✓",

  SICK: "ป",
  MATERNITY: "ค",
  PERSONAL: "ก",
  ANNUAL: "ล",
  ORDINATION: "อ",
  MILITARY: "ท",
  STUDY: "ศ",
  PATERNITY: "ภ",
  REHABILITATION: "ฟ",
  DHARMA: "ธ",
  INTERNATIONAL_WORK: "ร",
  FOLLOW_SPOUSE: "ต",
  HAJJ: "ฮ",

  ABSENT: "ข",
};

/**
 * แปลงจากสัญลักษณ์กลับเป็น key
 *
 * "ป" -> "SICK"
 * "ค" -> "MATERNITY"
 * "ล" -> "ANNUAL"
 */
export const SYMBOL_TO_KEY = Object.fromEntries(
  Object.entries(ATTENDANCE_SYMBOL).map(([key, symbol]) => [
    symbol,
    key,
  ]),
);

/**
 * ข้อมูลสำหรับแสดงผลของแต่ละประเภท
 */
export const LEAVE_META = {
  PRESENT: {
    symbol: ATTENDANCE_SYMBOL.PRESENT,
    label: "มาปฏิบัติงาน",
    color: "#16a34a",
    Icon: CheckCircle2,
  },

  SICK: {
    symbol: ATTENDANCE_SYMBOL.SICK,
    label: "ลาป่วย",
    color: "#dc2626",
    Icon: Stethoscope,
  },

  MATERNITY: {
    symbol: ATTENDANCE_SYMBOL.MATERNITY,
    label: "ลาคลอดบุตร",
    color: "#db2777",
    Icon: Baby,
  },

  PERSONAL: {
    symbol: ATTENDANCE_SYMBOL.PERSONAL,
    label: "ลากิจส่วนตัว",
    color: "#d97706",
    Icon: UserRound,
  },

  ANNUAL: {
    symbol: ATTENDANCE_SYMBOL.ANNUAL,
    label: "ลาพักผ่อน",
    color: "#2563eb",
    Icon: Palmtree,
  },

  ORDINATION: {
    symbol: ATTENDANCE_SYMBOL.ORDINATION,
    label: "ลาอุปสมบท",
    color: "#7c3aed",
    Icon: Moon,
  },

  MILITARY: {
    symbol: ATTENDANCE_SYMBOL.MILITARY,
    label: "ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล",
    color: "#475569",
    Icon: ShieldCheck,
  },

  STUDY: {
    symbol: ATTENDANCE_SYMBOL.STUDY,
    label: "ลาไปศึกษา ฝึกอบรม วิจัย ดูงาน",
    color: "#0891b2",
    Icon: GraduationCap,
  },

  PATERNITY: {
    symbol: ATTENDANCE_SYMBOL.PATERNITY,
    label: "ลาไปช่วยเหลือภริยาที่คลอดบุตร",
    color: "#c026d3",
    Icon: HandHeart,
  },

  REHABILITATION: {
    symbol: ATTENDANCE_SYMBOL.REHABILITATION,
    label: "ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ",
    color: "#ea580c",
    Icon: Accessibility,
  },

  DHARMA: {
    symbol: ATTENDANCE_SYMBOL.DHARMA,
    label: "ลาไปถือศีล ปฏิบัติธรรม",
    color: "#9333ea",
    Icon: Moon,
  },

  INTERNATIONAL_WORK: {
    symbol: ATTENDANCE_SYMBOL.INTERNATIONAL_WORK,
    label: "ลาไปปฏิบัติงานในองค์การระหว่างประเทศ",
    color: "#0284c7",
    Icon: Globe2,
  },

  FOLLOW_SPOUSE: {
    symbol: ATTENDANCE_SYMBOL.FOLLOW_SPOUSE,
    label: "ลาติดตามคู่สมรส",
    color: "#e11d48",
    Icon: Heart,
  },

  HAJJ: {
    symbol: ATTENDANCE_SYMBOL.HAJJ,
    label: "ลาไปประกอบพิธีฮัจย์",
    color: "#059669",
    Icon: Plane,
  },

  ABSENT: {
    symbol: ATTENDANCE_SYMBOL.ABSENT,
    label: "ขาดราชการ",
    color: "#64748b",
    Icon: CircleX,
  },
};

/**
 * ลำดับที่ใช้แสดงใน Legend
 */
export const LEAVE_ORDER = [
  "PRESENT",
  "SICK",
  "MATERNITY",
  "PERSONAL",
  "ANNUAL",
  "ORDINATION",
  "MILITARY",
  "STUDY",
  "PATERNITY",
  "REHABILITATION",
  "DHARMA",
  "INTERNATIONAL_WORK",
  "FOLLOW_SPOUSE",
  "HAJJ",
  "ABSENT",
];