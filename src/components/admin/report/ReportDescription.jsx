/* eslint-disable react/prop-types */

import { MONTHS } from "../../../constants/reportMockData";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

// "2025-04-01" → "1 เมษายน 2568"
const formatThaiDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// ปีงบประมาณ (พ.ศ.) จากวันเริ่ม: ต.ค. ขึ้นไปนับเป็นปีงบถัดไป
const fiscalYearBE = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return (d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear()) + 543;
};

export default function ReportDescription({ reportType, applied }) {
  return (
    <p className="text-center text-sm text-slate-600 pb-4 mb-4 border-b border-dashed border-slate-100">
      {reportType === "cycle" ? (
        <>
          ประจำรอบการประเมิน ครั้งที่ {applied.cycleNumber} ระหว่างวันที่{" "}
          {formatThaiDate(applied.cycleStart)} – {formatThaiDate(applied.cycleEnd)}
        </>
      ) : reportType === "fiscal" ? (
        <>
          ประจำปีงบประมาณ พ.ศ. {fiscalYearBE(applied.fiscalStart)} ระหว่างวันที่{" "}
          {formatThaiDate(applied.fiscalStart)} – {formatThaiDate(applied.fiscalEnd)}
        </>
      ) : (
        <>
          ประจำเดือน {MONTHS[applied.monthIndex]} {applied.year}
        </>
      )}
    </p>
  );
}
