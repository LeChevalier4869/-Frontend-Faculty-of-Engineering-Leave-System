import {
  TbReportAnalytics,
  TbFileExport,
} from "react-icons/tb";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

export default function ReportPage() {
  return (
    <div className="space-y-6 font-kanit">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center md:items-start">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200">
          <TbReportAnalytics className="text-sky-600" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
            Reports
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            รายงาน
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            สรุปและวิเคราะห์ข้อมูลการลาของบุคลากร
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">คำขอลาทั้งหมด</p>
              <h2 className="text-3xl font-bold mt-2">245</h2>
            </div>
            <FiUsers className="text-3xl text-sky-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">อนุมัติแล้ว</p>
              <h2 className="text-3xl font-bold mt-2">220</h2>
            </div>
            <FiCheckCircle className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">รออนุมัติ</p>
              <h2 className="text-3xl font-bold mt-2">12</h2>
            </div>
            <FiClock className="text-3xl text-amber-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">ปฏิเสธ</p>
              <h2 className="text-3xl font-bold mt-2">13</h2>
            </div>
            <FiXCircle className="text-3xl text-rose-500" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">ตัวกรองรายงาน</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="border rounded-xl px-3 py-2">
            <option>ปีงบประมาณ</option>
          </select>

          <select className="border rounded-xl px-3 py-2">
            <option>ประเภทการลา</option>
          </select>

          <select className="border rounded-xl px-3 py-2">
            <option>หน่วยงาน</option>
          </select>

          <select className="border rounded-xl px-3 py-2">
            <option>สถานะ</option>
          </select>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500">
            ค้นหา
          </button>

          <button className="px-4 py-2 rounded-xl border border-slate-300 flex items-center gap-2 hover:bg-slate-50">
            <TbFileExport />
            Export Excel
          </button>

          <button className="px-4 py-2 rounded-xl border border-slate-300 flex items-center gap-2 hover:bg-slate-50">
            <TbFileExport />
            Export PDF
          </button>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-80">
          <h2 className="font-semibold mb-4">
            สถิติการลาตามประเภท
          </h2>

          <div className="h-full flex items-center justify-center text-slate-400">
            พื้นที่สำหรับ Bar Chart
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-80">
          <h2 className="font-semibold mb-4">
            สัดส่วนประเภทการลา
          </h2>

          <div className="h-full flex items-center justify-center text-slate-400">
            พื้นที่สำหรับ Pie Chart
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold">
            รายงานการลา
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">ชื่อ</th>
                <th className="px-4 py-3 text-left">ประเภทลา</th>
                <th className="px-4 py-3 text-left">วันเริ่ม</th>
                <th className="px-4 py-3 text-left">วันสิ้นสุด</th>
                <th className="px-4 py-3 text-left">จำนวนวัน</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">สมชาย ใจดี</td>
                <td className="px-4 py-3">ลาป่วย</td>
                <td className="px-4 py-3">01/08/2569</td>
                <td className="px-4 py-3">03/08/2569</td>
                <td className="px-4 py-3">3</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                    อนุมัติแล้ว
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}