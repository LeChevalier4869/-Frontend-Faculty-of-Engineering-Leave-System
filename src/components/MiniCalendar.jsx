/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/**
 * สร้างข้อมูลปฏิทินเดือนปัจจุบันจากรายการลา + วันหยุด
 * - counts[day] = จำนวนใบลาที่ครอบวันนั้น (อนุมัติ/รออนุมัติ)
 * - holidayMap[day] = ชื่อวันหยุด
 */
export function buildLeaveCalendar(requests = [], holidays = [], now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const counts = {};
  const dayOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  for (const r of requests) {
    if (r.status === "REJECTED" || r.status === "CANCELLED") continue;
    if (!r.startDate || !r.endDate) continue;
    const s = dayOnly(new Date(r.startDate));
    const e = dayOnly(new Date(r.endDate));
    for (let d = 1; d <= daysInMonth; d++) {
      const cur = new Date(year, month, d);
      if (cur >= s && cur <= e) counts[d] = (counts[d] || 0) + 1;
    }
  }

  // วันหยุด: recurring จับเฉพาะเดือน+วัน (ข้ามปี), non-recurring ต้องตรงปีด้วย
  const holidayMap = {};
  for (const h of holidays) {
    if (!h.date) continue;
    const hd = new Date(h.date);
    if (hd.getMonth() !== month) continue;
    if (!h.isRecurring && hd.getFullYear() !== year) continue;
    holidayMap[hd.getDate()] = h.description || "วันหยุด";
  }

  return { year, month, daysInMonth, startWeekday, counts, holidayMap, today: now.getDate() };
}

// ปฏิทินย่อประจำเดือน — ไฮไลต์วันลาและวันหยุด (ใช้ร่วมได้ทุก dashboard)
export default function MiniCalendar({
  cal,
  countBadge = true,
  leaveLegendLabel = "มีคนลา",
  leaveTooltip = (c) => `${c} คนลา`,
}) {
  const { year, month, daysInMonth, startWeekday, counts, holidayMap = {}, today } = cal;
  const monthLabel = new Date(year, month, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <p className="mb-2 text-center text-sm font-medium text-slate-700">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 text-[11px] font-medium ${i === 0 || i === 6 ? "text-rose-400" : "text-slate-400"}`}
          >
            {w}
          </div>
        ))}
        {cells.map((d, idx) => {
          if (d === null) return <div key={`b${idx}`} />;
          const c = counts[d] || 0;
          const holiday = holidayMap[d];
          const isToday = d === today;
          const titleParts = [];
          if (holiday) titleParts.push(`วันหยุด: ${holiday}`);
          if (c > 0) titleParts.push(leaveTooltip(c));
          return (
            <div
              key={d}
              title={titleParts.join(" · ")}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-sm ${
                holiday
                  ? "bg-rose-50 font-semibold text-rose-600"
                  : c > 0
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-slate-600"
              } ${isToday ? "ring-2 ring-brand-400" : ""} ${holiday || c > 0 ? "cursor-default" : ""}`}
            >
              {d}
              {countBadge && c > 0 && (
                <span className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-semibold text-white">
                  {c}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-50 ring-1 ring-rose-200" />
          วันหยุด
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-50 ring-1 ring-brand-200" />
          {leaveLegendLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-brand-400" />
          วันนี้
        </span>
        <span className="text-slate-400">— เลื่อนเมาส์ที่วันเพื่อดูรายละเอียด</span>
      </div>
    </div>
  );
}

MiniCalendar.propTypes = {
  cal: PropTypes.object.isRequired,
  countBadge: PropTypes.bool,
  leaveLegendLabel: PropTypes.string,
  leaveTooltip: PropTypes.func,
};
