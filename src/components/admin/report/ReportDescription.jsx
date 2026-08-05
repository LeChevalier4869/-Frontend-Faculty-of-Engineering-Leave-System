/* eslint-disable react/prop-types */

import { MONTHS } from "../../../constants/reportMockData";

export default function ReportDescription({
  reportType,
  applied,
}) {
  return (
    <p className="text-center text-sm text-slate-600 pb-4 mb-4 border-b border-dashed border-slate-100">
      {reportType === "cycle" ? (
        <>
          ประจำรอบการประเมิน ครั้งที่ {applied.cycleNumber} ระหว่างวันที่{" "}
          {applied.cycleStart} – {applied.cycleEnd}
          <br />
          ประเภทบุคลากร {applied.personnelType}
        </>
      ) : reportType === "fiscal" ? (
        <>
          ประจำปีงบประมาณ พ.ศ. {applied.fiscalYear} ระหว่างวันที่{" "}
          {applied.fiscalStart} – {applied.fiscalEnd}
          <br />
          ประเภทบุคลากร {applied.personnelType}
        </>
      ) : (
        <>
          ประจำเดือน {MONTHS[applied.monthIndex]} {applied.year}
        </>
      )}
    </p>
  );
}