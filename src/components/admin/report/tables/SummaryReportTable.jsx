/* eslint-disable react/prop-types */

import ReportTh from "../elements/ReportTh";

export default function SummaryReportTable({ rows }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="border-collapse text-center text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            <ReportTh rowSpan={2} style={{ minWidth: 44 }}>
              ลำดับ
            </ReportTh>

            <ReportTh rowSpan={2} style={{ minWidth: 100 }}>
              เลขที่ตำแหน่ง
            </ReportTh>

            <ReportTh
              rowSpan={2}
              className="text-left"
              style={{ minWidth: 168 }}
            >
              ชื่อ-สกุล
            </ReportTh>

            <ReportTh colSpan={2}>
              ลาป่วย
            </ReportTh>

            <ReportTh colSpan={2}>
              ลากิจ
            </ReportTh>

            <ReportTh colSpan={2}>
              ลาพักผ่อน
            </ReportTh>

            <ReportTh rowSpan={2}>
              มาสาย(ครั้ง)
            </ReportTh>

            <ReportTh rowSpan={2}>
              ขาดราชการ(วัน)
            </ReportTh>

            <ReportTh rowSpan={2}>
              การลาประเภทอื่น ๆ (โปรดระบุ)
            </ReportTh>

            <ReportTh rowSpan={2}>
              หมายเหตุ
            </ReportTh>
          </tr>

          <tr className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            <ReportTh>ครั้ง</ReportTh>
            <ReportTh>วัน</ReportTh>

            <ReportTh>ครั้ง</ReportTh>
            <ReportTh>วัน</ReportTh>

            <ReportTh>ครั้ง</ReportTh>
            <ReportTh>วัน</ReportTh>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.name}
              className={
                index % 2 === 1
                  ? "bg-slate-50/60"
                  : "bg-white"
              }
            >
              <td className="border border-slate-100 px-2 py-1.5">
                {index + 1}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.positionNo || "-"}
              </td>

              <td className="border border-slate-100 px-3 py-1.5 text-left whitespace-nowrap font-medium text-slate-800">
                {row.name}
              </td>


              <td className="border border-slate-100 px-2 py-1.5">
                {row.sick.times || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.sick.days || "-"}
              </td>


              <td className="border border-slate-100 px-2 py-1.5">
                {row.personal.times || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.personal.days || "-"}
              </td>


              <td className="border border-slate-100 px-2 py-1.5">
                {row.annual.times || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.annual.days || "-"}
              </td>


              <td className="border border-slate-100 px-2 py-1.5">
                {row.late || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.absent || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.other || "-"}
              </td>

              <td className="border border-slate-100 px-2 py-1.5">
                {row.note || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}