/* eslint-disable react/prop-types */

export default function ReportHeader({ subtitle, brandColor = "#b23a47" }) {
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
          รายงานสรุปการลา
        </h1>

        <p className="text-sm text-slate-600">
          {subtitle || "สรุปและออกรายงานการลาของบุคลากร — ดูตัวอย่างก่อนดาวน์โหลด PDF/Word"}
        </p>
      </div>
    </div>
  );
}
