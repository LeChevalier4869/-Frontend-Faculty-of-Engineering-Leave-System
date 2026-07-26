/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileDown,
  FileText,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap');
`;

const BRAND = "#b23a47";
const GOLD = "#a8842f";

/**
 * สีของแต่ละประเภทวัน — ใช้ไอคอน + ข้อความ + ตัวเลขควบคู่เสมอ
 * เพื่อไม่ให้พึ่งพาสีอย่างเดียวในการสื่อความหมาย
 */
const LEAVE_META = {
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
const WEEKEND_META = {
  label: "วันหยุดราชการ",
  symbol: "-",
  color: "#94a3b8",
  Icon: Clock,
  desc: "วันหยุดราชการประจำสัปดาห์ ไม่นับเป็นวันทำการ",
};
const LEAVE_ORDER = ["PRESENT", "ANNUAL", "SICK", "PERSONAL", "ABSENT"];
const SYMBOL_TO_KEY = { "✓": "PRESENT", "ล": "ANNUAL", "ป": "SICK", "ก": "PERSONAL", "ข": "ABSENT" };

const REPORT_TYPES = [
  { key: "monthly", label: "ประจำเดือน" },
  { key: "cycle", label: "รอบประเมิน" },
  { key: "fiscal", label: "ปีงบประมาณ" },
];

const DEPARTMENTS = [
  "คณะวิศวกรรมศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะบริหารธุรกิจ",
  "คณะศิลปศาสตร์",
  "สำนักงานอธิการบดี",
];

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const YEARS = [2567, 2568, 2569, 2570];

const EMPLOYEES = [
  "นายสมชาย ใจดี",
  "นางสาวพิมพ์ใจ รุ่งเรือง",
  "นายวีระ ศักดิ์สิทธิ์",
  "นางสุนีย์ แสงทอง",
  "นายอนุชา พงษ์ไพร",
  "นางสาวกมลวรรณ ทองสุข",
  "นายธีรพงษ์ มั่นคง",
  "นางวรรณา ศรีสุข",
];

function daysInMonth(monthIndex, buddhistYear) {
  return new Date(buddhistYear - 543, monthIndex + 1, 0).getDate();
}
function weekdayOf(monthIndex, buddhistYear, day) {
  return new Date(buddhistYear - 543, monthIndex, day).getDay();
}
function symbolFor(empIndex, day) {
  const seed = (empIndex * 7 + day * 3) % 23;
  if (seed === 0) return "ป";
  if (seed === 3) return "ก";
  if (seed === 11) return "ล";
  if (seed === 19) return "ข";
  return "✓";
}

export default function AttendanceReport() {
  const [reportType, setReportType] = useState("monthly");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [monthIndex, setMonthIndex] = useState(6);
  const [year, setYear] = useState(2569);
  const [applied, setApplied] = useState({
    department: DEPARTMENTS[0],
    monthIndex: 6,
    year: 2569,
  });
  const [activeSymbolKey, setActiveSymbolKey] = useState(null); // key ของ LEAVE_META หรือ "WEEKEND"

  const totalDays = useMemo(() => daysInMonth(applied.monthIndex, applied.year), [applied]);
  const dayList = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  const rows = useMemo(() => {
    return EMPLOYEES.map((name, empIdx) => {
      const cells = dayList.map((day) => {
        const isWeekend = [0, 6].includes(weekdayOf(applied.monthIndex, applied.year, day));
        if (isWeekend) return { day, symbol: "-", weekend: true };
        return { day, symbol: symbolFor(empIdx, day), weekend: false };
      });
      const tally = { PRESENT: 0, ANNUAL: 0, SICK: 0, PERSONAL: 0, ABSENT: 0 };
      cells.forEach((c) => {
        if (!c.weekend) tally[SYMBOL_TO_KEY[c.symbol]] += 1;
      });
      return { name, cells, tally };
    });
  }, [dayList, applied]);

  const handleApply = () => setApplied({ department, monthIndex, year });
  const handleReset = () => {
    setReportType("monthly");
    setDepartment(DEPARTMENTS[0]);
    setMonthIndex(6);
    setYear(2569);
    setApplied({ department: DEPARTMENTS[0], monthIndex: 6, year: 2569 });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      <style>{FONTS}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
              style={{ backgroundColor: `${BRAND}0d`, borderColor: `${BRAND}33` }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: BRAND }}
              >
                Attendance Report
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
              รายงานประจำเดือน
            </h1>
            <p className="text-sm text-slate-600">
              {applied.department} · {MONTHS[applied.monthIndex]} {applied.year}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
        </div>

        {/* ---------- ตัวกรอง ---------- */}
        <Panel title="ตัวกรองรายงาน" subtitle="เลือกช่วงเวลาและหน่วยงานที่ต้องการแสดงผล">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                ประเภทรายงาน
              </label>
              <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden">
                {REPORT_TYPES.map((t, i) => (
                  <button
                    key={t.key}
                    onClick={() => setReportType(t.key)}
                    className={
                      "px-4 py-2 text-sm font-medium transition-colors " +
                      (i !== 0 ? "border-l border-slate-300 " : "") +
                      (reportType === t.key
                        ? "text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50")
                    }
                    style={reportType === t.key ? { backgroundColor: BRAND } : {}}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  หน่วยงาน
                </label>
                <SelectField value={department} onChange={setDepartment} options={DEPARTMENTS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  เดือน
                </label>
                <SelectField
                  value={monthIndex}
                  onChange={(v) => setMonthIndex(Number(v))}
                  options={MONTHS}
                  optionValues={MONTHS.map((_, i) => i)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ปี
                </label>
                <SelectField
                  value={year}
                  onChange={(v) => setYear(Number(v))}
                  options={YEARS}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                ล้างข้อมูล
              </button>
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <Search className="h-4 w-4" />
                แสดงรายงาน
              </button>
            </div>
          </div>
        </Panel>

        {/* ---------- ตารางรายงาน ---------- */}
        <Panel
          title="รายงานสรุปการลาและการมาปฏิบัติราชการของบุคลากร"
          subtitle={`มหาวิทยาลัยเทคโนโลยีอีสาน วิทยาเขตขอนแก่น · สังกัด ${applied.department}`}
        >
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="border-collapse text-center text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <ReportTh className="sticky left-0 z-20 bg-slate-50" style={{ minWidth: 44 }}>
                    ลำดับ
                  </ReportTh>
                  <ReportTh className="sticky z-20 text-left bg-slate-50" style={{ minWidth: 168, left: 44 }}>
                    ชื่อ-สกุล
                  </ReportTh>
                  {dayList.map((d) => (
                    <ReportTh key={d} style={{ minWidth: 30 }}>{d}</ReportTh>
                  ))}
                  <ReportTh style={{ minWidth: 64 }}>รวมวันมา</ReportTh>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.name} className={i % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                    <td
                      className="border border-slate-100 px-2 py-1.5 sticky z-10"
                      style={{ left: 0, background: i % 2 === 1 ? "#f8fafc" : "white" }}
                    >
                      {i + 1}
                    </td>
                    <td
                      className="border border-slate-100 px-3 py-1.5 text-left whitespace-nowrap font-medium text-slate-800 sticky z-10"
                      style={{ left: 44, background: i % 2 === 1 ? "#f8fafc" : "white" }}
                    >
                      {row.name}
                    </td>
                    {row.cells.map((c) => (
                      <td
                        key={c.day}
                        onClick={() =>
                          setActiveSymbolKey(c.weekend ? "WEEKEND" : SYMBOL_TO_KEY[c.symbol])
                        }
                        className="border border-slate-100 px-1 py-1.5 text-[13px] font-medium cursor-pointer hover:bg-slate-50 transition-colors"
                        style={{
                          color: c.weekend ? "#94a3b8" : LEAVE_META[SYMBOL_TO_KEY[c.symbol]].color,
                          background: c.weekend ? "#f8fafc" : "transparent",
                        }}
                      >
                        {c.symbol}
                      </td>
                    ))}
                    <td className="border border-slate-100 px-2 py-1.5 font-semibold bg-slate-50">
                      {row.tally.PRESENT}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 mt-2 border-t border-slate-100">
            {LEAVE_ORDER.map((k) => {
              const meta = LEAVE_META[k];
              return (
                <button
                  key={k}
                  onClick={() => setActiveSymbolKey(k)}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <meta.Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  <span className="font-semibold" style={{ color: meta.color }}>{meta.symbol}</span>
                  = {meta.label}
                </button>
              );
            })}
            <button
              onClick={() => setActiveSymbolKey("WEEKEND")}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="font-semibold">-</span> = วันหยุดราชการ
            </button>
          </div>
        </Panel>
      </div>

      <SymbolMeaningModal
        symbolKey={activeSymbolKey}
        onClose={() => setActiveSymbolKey(null)}
      />
    </div>
  );
}

/* ---------------- ส่วนประกอบย่อย ---------------- */

function SymbolMeaningModal({ symbolKey, onClose }) {
  if (!symbolKey) return null;
  const meta = symbolKey === "WEEKEND" ? WEEKEND_META : LEAVE_META[symbolKey];
  const { label, symbol, color, Icon, desc } = meta;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      style={{ fontFamily: "'Kanit', sans-serif" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-semibold"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              {symbol}
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">{label}</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                สัญลักษณ์ในตารางการมา-ลา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function ReportTh({ children, className = "", style = {} }) {
  return (
    <th
      className={"border border-slate-100 px-2 py-2 font-semibold whitespace-nowrap " + className}
      style={style}
    >
      {children}
    </th>
  );
}

function SelectField({ value, onChange, options, optionValues }) {
  const values = optionValues || options;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
      >
        {options.map((label, i) => (
          <option key={label} value={values[i]}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}