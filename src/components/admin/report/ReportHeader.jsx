/* eslint-disable react/prop-types */

import { FileDown } from "lucide-react";

export default function ReportHeader({
  department,
  month,
  year,
  brandColor = "#b23a47",
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
          style={{
            backgroundColor: `${brandColor}0d`,
            borderColor: `${brandColor}33`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

          <span
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: brandColor }}
          >
            Admin View
          </span>
        </div>

        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
          รายงานประจำเดือน
        </h1>

        <p className="text-sm text-slate-600">
          {department} · {month} {year}
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
  );
}