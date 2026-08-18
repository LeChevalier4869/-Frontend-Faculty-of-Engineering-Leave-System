/* eslint-disable react/prop-types */
import ReportTh from "../elements/ReportTh";
import { LEAVE_META, SYMBOL_TO_KEY } from "../../../../constants/leaveMeta";

export default function MonthlyReportTable({ dayList, rows, onSymbolClick }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <div className="w-fit mx-auto">
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
                <ReportTh
                  key={d}
                  style={{
                    width: 26,
                    minWidth: 26,
                    maxWidth: 26,
                  }}
                >
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
                {/* ลำดับ */}
                <td
                  className="border border-slate-100 px-2 py-1.5 sticky z-10"
                  style={{
                    left: 0,
                    background: i % 2 === 1 ? "#f8fafc" : "white",
                  }}
                >
                  {i + 1}
                </td>

                {/* ชื่อ */}
                <td
                  className="border border-slate-100 px-3 py-1.5 text-left whitespace-nowrap font-medium text-slate-800 sticky z-10"
                  style={{
                    left: 44,
                    background: i % 2 === 1 ? "#f8fafc" : "white",
                  }}
                >
                  {row.name}
                </td>

                {/* วันที่ */}
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
                    className="border border-slate-100 px-0 py-1.5 text-[12px] font-medium cursor-pointer hover:bg-slate-50 transition-colors"
                    style={{
                      width: 26,
                      minWidth: 26,
                      maxWidth: 26,
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

                {/* รวมวันมา */}
                <td className="border border-slate-100 px-2 py-1.5 font-semibold bg-slate-50">
                  {row.tally.PRESENT}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
