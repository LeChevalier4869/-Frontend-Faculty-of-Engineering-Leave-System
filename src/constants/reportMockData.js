export const REPORT_TYPES = [
  { key: "monthly", label: "ประจำเดือน" },
  { key: "cycle", label: "รอบประเมิน" },
  { key: "fiscal", label: "ปีงบประมาณ" },
];

export const DEPARTMENTS = [
  "คณะวิศวกรรมศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะบริหารธุรกิจ",
  "คณะศิลปศาสตร์",
  "สำนักงานอธิการบดี",
];

export const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const YEARS = [
  2567,
  2568,
  2569,
  2570,
];

export const EMPLOYEES = [
  "นายสมชาย ใจดี",
  "นางสาวพิมพ์ใจ รุ่งเรือง",
  "นายวีระ ศักดิ์สิทธิ์",
  "นางสุนีย์ แสงทอง",
  "นายอนุชา พงษ์ไพร",
  "นางสาวกมลวรรณ ทองสุข",
  "นายธีรพงษ์ มั่นคง",
  "นางวรรณา ศรีสุข",
];

export const PERSONNEL_TYPES = [
  "ข้าราชการ",
  "พนักงานมหาวิทยาลัย",
  "ลูกจ้างประจำ",
  "ลูกจ้างชั่วคราว",
  "ข้าราชการพลเรือนในสถาบันอุดมศึกษา",
];


/**
 * ข้อมูลตัวอย่างรายงานสรุป
 * ใช้ร่วมกับ
 * - รอบประเมิน
 * - ปีงบประมาณ
 */
export const SUMMARY_ROWS = [
  {
    name: "นาย สมชาย ใจดี",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นางสาว พิมพ์ใจ รุ่งเรือง",
    positionNo: "",
    sick: {
      times: 1,
      days: 2,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นาย วีระ ศักดิ์สิทธิ์",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นาง สุนีย์ แสงทอง",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 2,
      days: 2,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นาย อนุชา พงษ์ไพร",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นางสาว กมลวรรณ ทองสุข",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 1,
      days: 3,
    },
    late: 2,
    absent: 0,
    other: "",
    note: "",
  },

  {
    name: "นาย ธีรพงษ์ มั่นคง",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 1,
    other: "",
    note: "",
  },

  {
    name: "นาง วรรณา ศรีสุข",
    positionNo: "",
    sick: {
      times: 0,
      days: 0,
    },
    personal: {
      times: 0,
      days: 0,
    },
    annual: {
      times: 0,
      days: 0,
    },
    late: 0,
    absent: 0,
    other: "",
    note: "",
  },
];