import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import { Plus } from "lucide-react";
import LeaveRequestModal from "./LeaveRequestModal";

function Leave2() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(getApiUrl("leave-requests/landing"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequest(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลการลา...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      {/* กล่องขาวตรงกลาง */}
      <div className="max-w-7xl mx-auto bg-white text-black rounded-2xl shadow p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">รายการการลา</h1>

          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-sm">
              Filter
            </button>
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-sm">
              Group By
            </button>
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg text-sm">
              Actions
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              + ยื่นลา
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-6 items-center mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Requested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rejected</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                {["วันที่ยื่น", "ประเภทการลา", "วันเริ่มต้น", "วันสิ้นสุด", "สถานะ"].map((header, idx) => (
                  <th key={idx} className="p-3 text-left font-semibold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveRequest.length > 0 ? (
                leaveRequest.map((leave) => (
                  <tr
                    key={leave.id}
                    className="border-t hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="p-3">{formatDate(leave.createdAt)}</td>
                    <td className="p-3">{leaveTypes[leave.leaveTypeId] || "-"}</td>
                    <td className="p-3">{formatDate(leave.startDate)}</td>
                    <td className="p-3">{formatDate(leave.endDate)}</td>
                    <td className="p-3 text-center">
                      <div
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                          ${leave.status === "APPROVED" ? "bg-green-100 text-green-700"
                          : leave.status === "PENDING" ? "bg-yellow-100 text-yellow-700"
                          : leave.status === "REJECTED" ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"}`}
                      >
                        {leave.status}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    ไม่มีข้อมูลการลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchLeaveRequests();
        }}
      />
    </div>
  );
}

export default Leave2;