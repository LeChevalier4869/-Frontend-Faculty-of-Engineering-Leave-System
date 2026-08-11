/* eslint-disable react/prop-types */
import ReportTh from "../elements/ReportTh";
// TODO: ปรับ path ให้ตรงกับตำแหน่งจริงที่เก็บไฟล์ leaveMeta.js
import {
  LEAVE_META,
  LEAVE_ORDER,
  SYMBOL_TO_KEY,
} from "../../../../constants/leaveMeta";

/**
 * ตารางเช็คชื่อรายวันของรายงาน "ประจำเดือน" พร้อม legend ท้ายตาราง
 *
 * props:
 * - dayList: number[]  รายการวันที่ 1..จำนวนวันในเดือน
 * - rows: { name, cells: { day, symbol, weekend }[], tally }[]  ข้อมูลรายคนที่คำนวณไว้แล้ว
 * - onSymbolClick: (key: string) => void  เรียกเมื่อกดที่ตัวสัญลักษณ์ในตารางหรือ legend
 *   key เป็น "PRESENT" | "ANNUAL" | "SICK" | "PERSONAL" | "ABSENT" | "WEEKEND"
 */
export default function MonthlyReportTable({ dayList, rows, onSymbolClick }) {
  return (
    <>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="border-collapse text-center text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <ReportTh
                className="sticky left-0 z-20 bg-slate-50"
                style={{ minWidth: 44 }}
              >
                ลำดับ
              </ReportTh>
              <ReportTh
                className="sticky z-20 text-left bg-slate-50"
                style={{ minWidth: 168, left: 44 }}
              >
                ชื่อ-สกุล
              </ReportTh>
              {dayList.map((d) => (
                <ReportTh key={d} style={{ minWidth: 30 }}>
                  {d}
                </ReportTh>
              ))}
              <ReportTh style={{ minWidth: 64 }}>รวมวันมา</ReportTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.userId ?? `${row.name}-${i}`}
                className={i % 2 === 1 ? "bg-slate-50/60" : "bg-white"}
              >
                <td
                  className="border border-slate-100 px-2 py-1.5 sticky z-10"
                  style={{
                    left: 0,
                    background: i % 2 === 1 ? "#f8fafc" : "white",
                  }}
                >
                  {i + 1}
                </td>
                <td
                  className="border border-slate-100 px-3 py-1.5 text-left whitespace-nowrap font-medium text-slate-800 sticky z-10"
                  style={{
                    left: 44,
                    background: i % 2 === 1 ? "#f8fafc" : "white",
                  }}
                >
                  {row.name}
                </td>
                {row.cells.map((c) => (
                  <td
                    key={c.day}
                    onClick={() => {
                      const key = c.weekend
                        ? "WEEKEND"
                        : SYMBOL_TO_KEY[c.symbol];

                      if (key) {
                        onSymbolClick(key);
                      }
                    }}
                    className="border border-slate-100 px-1 py-1.5 text-[13px] font-medium cursor-pointer hover:bg-slate-50 transition-colors"
                    style={{
                      color: c.weekend
                        ? "#94a3b8"
                        : (LEAVE_META[SYMBOL_TO_KEY[c.symbol]]?.color ??
                          "#334155"),
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
              onClick={() => onSymbolClick(k)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <meta.Icon
                className="h-3.5 w-3.5"
                style={{ color: meta.color }}
              />
              <span className="font-semibold" style={{ color: meta.color }}>
                {meta.symbol}
              </span>
              = {meta.label}
            </button>
          );
        })}
        <button
          onClick={() => onSymbolClick("WEEKEND")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <span className="font-semibold">-</span> = วันหยุดราชการ
        </button>
      </div>
    </>
  );
}
