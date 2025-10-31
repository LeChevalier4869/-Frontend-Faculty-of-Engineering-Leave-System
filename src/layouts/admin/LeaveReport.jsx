import React, { useState } from 'react';
import axios from 'axios';
import { apiEndpoints } from "../../utils/api";
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
  const [filters, setFilters] = useState({
    organizationId: '',
    startDate: '',
    endDate: '',
    countReport: '4',
    customCount: '',
    format: 'pdf',
  });

  const organizations = [
    { id: 1, name: 'คณะวิศวกรรมศาสตร์' },
    { id: 2, name: 'คณะวิทยาศาสตร์' },
    { id: 3, name: 'คณะสถาปัตยกรรม' },
  ];

  const topCount =
    filters.countReport === 'custom' && filters.customCount
      ? parseInt(filters.customCount)
      : parseInt(filters.countReport);

  const filteredData = mockData
    .sort((a, b) => b.days - a.days)
    .slice(0, topCount);

  const handleExport = async () => {
    if (!filters.startDate || !filters.endDate || !filters.organizationId) {
      alert('กรุณาเลือกคณะ และวันที่เริ่มต้น/สิ้นสุด');
      return;
    }

    const payload = {
      organizationId: parseInt(filters.organizationId),
      startDate: filters.startDate,
      endDate: filters.endDate,
      countReport:
        filters.countReport === 'custom' ? filters.customCount : filters.countReport,
      format: filters.format,
    };

    try {
      // const response = await axios.post(
      //   apiEndpoints.exportReport, // เปลี่ยนเป็น endpoint จริง
      //   payload,
      //   { responseType: 'blob' } // important! รับเป็นไฟล์ binary
      // );
      const response = await axios.post(
        'http://localhost:8000/api/export-report', // เปลี่ยนเป็น endpoint จริง
        payload,
        { responseType: 'blob' } // important! รับเป็นไฟล์ binary
      );

      // สร้างลิงก์ดาวน์โหลด
      const blob = new Blob([response.data], {
        type: filters.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `leave_report.${filters.format === 'pdf' ? 'pdf' : 'docx'}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kanit text-black">
      <h1 className="mb-4 text-2xl font-bold">รายงานสรุปวันลาของพนักงาน</h1>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <select
          value={filters.organizationId}
          onChange={(e) => setFilters({ ...filters, organizationId: e.target.value })}
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- เลือกคณะ --</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filters.countReport}
          onChange={(e) => setFilters({ ...filters, countReport: e.target.value })}
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="custom">กำหนดเอง</option>
        </select>

        {filters.countReport === 'custom' && (
          <input
            type="number"
            min="1"
            max={mockData.length}
            value={filters.customCount}
            onChange={(e) => setFilters({ ...filters, customCount: e.target.value })}
            placeholder="จำนวน..."
            className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm w-24 focus:ring-2 focus:ring-blue-500"
          />
        )}

        <select
          value={filters.format}
          onChange={(e) => setFilters({ ...filters, format: e.target.value })}
          className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
        </select>

        <button
          className="rounded-lg bg-black px-3 py-1 text-sm text-white transition hover:bg-gray-800"
          onClick={handleExport}
        >
          Export
        </button>
      </div>

      {/* Chart */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Top {topCount} ผู้ลาเยอะที่สุด</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={filteredData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
              {filteredData.map((row) => (
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
