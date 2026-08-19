import PropTypes from "prop-types";
import { PERIOD_OPTIONS, getPeriodRange, formatPeriodRangeLabel } from "../utils/periodRange";

// ตัวเลือกช่วงเวลาแบบ segmented + ป้ายบอกช่วงข้อมูลที่กำลังแสดง (ใช้ร่วมได้ทุก dashboard)
export default function PeriodFilter({ value, onChange, className = "" }) {
  const range = getPeriodRange(value);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {PERIOD_OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              value === o.key
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-500">
        แสดงข้อมูลช่วง: <span className="font-medium text-slate-600">{formatPeriodRangeLabel(range)}</span>
      </span>
    </div>
  );
}

PeriodFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
