import {
  CheckCircle2,
  Stethoscope,
  UserRound,
  Palmtree,
  Baby,
  GraduationCap,
  Globe2,
  Heart,
  Moon,
  CircleX,
  Clock3,
  FlaskConical,
  Shield,
  Accessibility,
  HandHeart,
} from "lucide-react";

/**
 * สัญลักษณ์การมาปฏิบัติงาน / การลา
 *
 * key = ค่าที่มาจาก API
 * symbol = สัญลักษณ์ที่แสดงในตาราง
 */
export const ATTENDANCE_SYMBOL = {
  PRESENT: "/",
  LATE: "ส",

  PERSONAL: "ก",
  SICK: "ป",
  ANNUAL: "พ",
  MATERNITY: "ค",
  PATERNITY: "ช",
  ORDINATION: "บ",
  DHARMA: "บ",
  HAJJ: "บ",
  STUDY: "ศ",
  MILITARY: "อ1",
  INTERNATIONAL_WORK: "อ2",
  FOLLOW_SPOUSE: "อ3",
  REHABILITATION: "อ4",
  TRAINING_RESEARCH: "ว",
  OFFICIAL_DUTY: "ร",

  ABSENT: "ข",
};

/**
 * แปลงจากสัญลักษณ์กลับเป็น key
 *
 * หมายเหตุ:
 * บ = ORDINATION / DHARMA / HAJJ
 *
 * เนื่องจากหลายประเภทใช้สัญลักษณ์เดียวกัน
 * จึงไม่สามารถระบุ key เดิมจาก symbol "บ" ได้แบบ 1:1
 */
export const SYMBOL_TO_KEY = Object.fromEntries(
  Object.entries(ATTENDANCE_SYMBOL).map(([key, symbol]) => [symbol, key]),
);

/**
 * ข้อมูลสำหรับแสดงผลของแต่ละประเภท
 */
export const LEAVE_META = {
  PRESENT: {
    symbol: ATTENDANCE_SYMBOL.PRESENT,
    label: "มาปฏิบัติราชการ",
    color: "#16a34a",
    Icon: CheckCircle2,
  },

  LATE: {
    symbol: ATTENDANCE_SYMBOL.LATE,
    label: "สาย",
    color: "#ca8a04",
    Icon: Clock3,
  },

  PERSONAL: {
    symbol: ATTENDANCE_SYMBOL.PERSONAL,
    label: "ลากิจส่วนตัว",
    color: "#d97706",
    Icon: UserRound,
  },

  SICK: {
    symbol: ATTENDANCE_SYMBOL.SICK,
    label: "ลาป่วย",
    color: "#dc2626",
    Icon: Stethoscope,
  },

  ANNUAL: {
    symbol: ATTENDANCE_SYMBOL.ANNUAL,
    label: "ลาพักผ่อน",
    color: "#2563eb",
    Icon: Palmtree,
  },

  MATERNITY: {
    symbol: ATTENDANCE_SYMBOL.MATERNITY,
    label: "ลาคลอดบุตร",
    color: "#db2777",
    Icon: Baby,
  },

  PATERNITY: {
    symbol: ATTENDANCE_SYMBOL.PATERNITY,
    label: "ลาช่วยภริยาคลอดบุตร",
    color: "#e11d48",
    Icon: Heart,
  },

  ORDINATION: {
    symbol: ATTENDANCE_SYMBOL.ORDINATION,
    label: "ลาอุปสมบท / พิธีฮัจย์ / ปฏิบัติธรรม (สตรี)",
    color: "#7c3aed",
    Icon: Moon,
  },

  DHARMA: {
    symbol: ATTENDANCE_SYMBOL.DHARMA,
    label: "ลาอุปสมบท / พิธีฮัจย์ / ปฏิบัติธรรม (สตรี)",
    color: "#7c3aed",
    Icon: Moon,
  },

  HAJJ: {
    symbol: ATTENDANCE_SYMBOL.HAJJ,
    label: "ลาอุปสมบท / พิธีฮัจย์ / ปฏิบัติธรรม (สตรี)",
    color: "#7c3aed",
    Icon: Moon,
  },

  STUDY: {
    symbol: ATTENDANCE_SYMBOL.STUDY,
    label: "ลาไปศึกษา",
    color: "#0891b2",
    Icon: GraduationCap,
  },

  MILITARY: {
    symbol: ATTENDANCE_SYMBOL.MILITARY,
    label: "ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล",
    color: "#475569",
    Icon: Shield,
  },

  INTERNATIONAL_WORK: {
    symbol: ATTENDANCE_SYMBOL.INTERNATIONAL_WORK,
    label: "ลาไปปฏิบัติงานในองค์การระหว่างประเทศ",
    color: "#0369a1",
    Icon: Globe2,
  },

  FOLLOW_SPOUSE: {
    symbol: ATTENDANCE_SYMBOL.FOLLOW_SPOUSE,
    label: "ลาติดตามคู่สมรส",
    color: "#be123c",
    Icon: Heart,
  },

  REHABILITATION: {
    symbol: ATTENDANCE_SYMBOL.REHABILITATION,
    label: "ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ",
    color: "#9333ea",
    Icon: Accessibility,
  },

  TRAINING_RESEARCH: {
    symbol: ATTENDANCE_SYMBOL.TRAINING_RESEARCH,
    label: "ลาไปฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน",
    color: "#0e7490",
    Icon: FlaskConical,
  },

  OFFICIAL_DUTY: {
    symbol: ATTENDANCE_SYMBOL.OFFICIAL_DUTY,
    label: "ไปราชการ",
    color: "#0284c7",
    Icon: HandHeart,
  },

  ABSENT: {
    symbol: ATTENDANCE_SYMBOL.ABSENT,
    label:
      "ไม่มีข้อมูลการลงเวลา หรือไม่มีข้อมูลการลา หรือไม่มีข้อมูลไปราชการ หรือขาดราชการไม่ทราบสาเหตุ",
    color: "#64748b",
    Icon: CircleX,
  },
};

/**
 * ลำดับที่ใช้แสดงใน Legend
 */
export const LEAVE_ORDER = [
  "PRESENT",
  "LATE",
  "PERSONAL",
  "SICK",
  "ANNUAL",
  "MATERNITY",
  "PATERNITY",
  "ORDINATION",
  "STUDY",
  "MILITARY",
  "INTERNATIONAL_WORK",
  "FOLLOW_SPOUSE",
  "REHABILITATION",
  "TRAINING_RESEARCH",
  "OFFICIAL_DUTY",
  "ABSENT",
];
