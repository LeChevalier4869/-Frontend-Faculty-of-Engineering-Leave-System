import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddLeave from "./AddLeave";

function Leave() {
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      type: "ลาป่วย",
      startDate: "2024-12-26",
      endDate: "2024-12-27",
      reason: "เป็นไข้หวัด",
    },
    {
      id: 2,
      type: "ลากิจ",
      startDate: "2024-12-30",
      endDate: "2024-12-31",
      reason: "ไปทำธุระส่วนตัว",
    },
  ]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("คุณต้องการลบรายการนี้หรือไม่?");
    if (confirmDelete) {
      setLeaves(leaves.filter((leave) => leave.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">รายการการลา</h2>
        <Link
          to="/leave/add"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + เพิ่มคำขอลา
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                ประเภทการลา
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                วันที่เริ่ม
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                วันที่สิ้นสุด
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                เหตุผล
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave, index) => (
                <tr key={leave.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.type}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.startDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.endDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.reason}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2"
                    >
                      ยกเลิก
                    </button>
                    <Link
                      to={`/leave/edit/${leave.id}`}
                      className="btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                >
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leave;
