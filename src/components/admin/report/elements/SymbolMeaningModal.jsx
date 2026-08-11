import { X } from "lucide-react";
import { LEAVE_META } from "../../../../constants/leaveMeta";
export default function SymbolMeaningModal({ symbolKey, onClose }) {
  if (!symbolKey) return null;
  const meta =
    symbolKey === "WEEKEND"
      ? {
          label: "วันหยุด",
          symbol: "-",
          color: "#94a3b8",
          Icon: null,
          desc: "วันหยุดเสาร์-อาทิตย์ ไม่ถือเป็นวันปฏิบัติงาน",
        }
      : LEAVE_META[symbolKey];
  if (!meta) return null;
  const { label, symbol, color, Icon, desc } = meta;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      style={{ fontFamily: "'Kanit', sans-serif" }}
      onClick={onClose}
    >
      {" "}
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-semibold"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              {" "}
              {symbol}{" "}
            </span>{" "}
            <div>
              {" "}
              <p className="text-base font-semibold text-slate-900">
                {" "}
                {label}{" "}
              </p>{" "}
              <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                {" "}
                {Icon && (
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                )}{" "}
                สัญลักษณ์ในตารางการมา-ลา{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            {" "}
            <X className="h-4 w-4" />{" "}
          </button>{" "}
        </div>{" "}
        <div className="px-5 py-4">
          {" "}
          <p className="text-sm leading-relaxed text-slate-600">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
