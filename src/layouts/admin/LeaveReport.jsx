import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'สมชาย มาตรฐาน', days: 12 },
  { name: 'สมหญิง จันทร์ฉาย', days: 8 },
  { name: 'สมปอง ใจดี', days: 5 },
  { name: 'สมพร แก้วใส', days: 3 },
];

export default function LeaveReportMockup() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kanit">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">รายงานสรุปวันลาของพนักงาน</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="month"
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
        />
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Export PDF
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Top 4 ผู้ลาเยอะที่สุด</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Bar dataKey="days" fill="#3b82f6" barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">รายละเอียดวันลา</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-2 text-left text-white font-medium">ชื่อพนักงาน</th>
                <th className="px-4 py-2 text-left text-white font-medium">จำนวนวันลา (วัน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{row.name}</td>
                  <td className="px-4 py-2 text-gray-700">{row.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
