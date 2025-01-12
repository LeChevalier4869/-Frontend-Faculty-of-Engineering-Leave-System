import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLeaveRequest from "../hooks/useLeaveRequest";
import getApiUrl from "../utils/apiUtils";

function Leave2() {
  const { leaveRequest, setLeaveRequest } = useLeaveRequest();
  console.log(leaveRequest);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("คุณต้องการลบรายการนี้หรือไม่?");
    if (confirmDelete) {
      try {
        let token = localStorage.getItem("token");
        await axios.delete(getApiUrl(`leave-requests/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequest(leaveRequest.filter((leave) => leave.id !== id));
      } catch (err) {
        console.error("Failed to delete:", err.message);
      }
    }
  };

  //   const formatDate = (date) => {
  //     new Date(date).toLocaleDateString("th-TH", {
  //         year: "numeric",
  //         month: "numeric",
  //         day: "numeric",
  //     });
  //   };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
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
            {Array.isArray(leaveRequest) && leaveRequest.length > 0 ? (
              leaveRequest.map((leave, index) => (
                <tr key={leave.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.leaveType.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(leave.startDate)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(leave.endDate)}
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

export default Leave2;
