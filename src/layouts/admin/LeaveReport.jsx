import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { name: 'สมชาย มาตรฐาน', days: 12 },
  { name: 'สมหญิง จันทร์ฉาย', days: 8 },
  { name: 'สมปอง ใจดี', days: 5 },
  { name: 'สมพร แก้วใส', days: 3 },
];

export default function LeaveReportMockup() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kanit text-black">
      <h1 className="mb-4 text-2xl font-bold">รายงานสรุปวันลาของพนักงาน</h1>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="month"
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button className="rounded-lg bg-black px-3 py-1 text-sm text-white transition hover:bg-gray-800">
          Export PDF
        </button>
      </div>

      {/* Chart */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Top 4 ผู้ลาเยอะที่สุด</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="#000000"
              tick={{ fontSize: 11, fill: '#000000' }}
            />
            <YAxis stroke="#000000" tick={{ fontSize: 11, fill: '#000000' }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Bar dataKey="days" fill="#3b82f6" barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">รายละเอียดวันลา</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-2 text-left font-medium">ชื่อพนักงาน</th>
                <th className="px-4 py-2 text-left font-medium">จำนวนวันลา (วัน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
