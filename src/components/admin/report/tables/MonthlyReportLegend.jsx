/* eslint-disable react/prop-types */
import {
  LEAVE_META,
  LEAVE_ORDER,
} from "../../../../constants/leaveMeta";

export default function MonthlyReportLegend({ onSymbolClick }) {
  return (
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

            <span
              className="font-semibold"
              style={{ color: meta.color }}
            >
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
        <span className="font-semibold">-</span>
        {" = วันหยุดราชการ"}
      </button>
    </div>
  );
}