import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import LeaveRequestModal from "./LeaveRequestModal";

const PAGE_SIZE = 8;

export default function Leave2() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // default date filter to today
  const today = dayjs().format("YYYY-MM-DD");
  const [filterDate, setFilterDate] = useState(today);

  const leaveTypes = { 1: "ลาป่วย", 2: "ลากิจส่วนตัว", 3: "ลาพักผ่อน" };
  const statusLabels = {
    APPROVED: "อนุมัติแล้ว",
    PENDING: "รออนุมัติ",
    REJECTED: "ปฏิเสธ",
    CANCELLED: "ยกเลิก",
  };
  const statusColors = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const url = getApiUrl("leave-requests/me");
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const items = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.leaveRequest)
        ? res.data.leaveRequest
        : [];
      setLeaveRequest(items);
    } catch (err) {
      console.error("fetchLeaveRequests error:", err);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const formatDate = (dateStr) =>
    dayjs(dateStr).locale("th").format("DD/MM/YYYY");

  const filteredRequests = useMemo(() => {
    if (!filterDate) return leaveRequest;
    return leaveRequest.filter((lr) =>
      dayjs(lr.createdAt).format("YYYY-MM-DD") === filterDate
    );
  }, [leaveRequest, filterDate]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const displayItems = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลการลา...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">รายการการลา</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            + ยื่นลา
          </button>
        </div>

        {/* filter */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              setFilterDate(today);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            ล้าง
          </button>
        </div>

        {/* legend */}
        <div className="flex gap-6 items-center text-sm mb-6">
          {Object.entries(statusLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[key]}`} />
              <span className="text-gray-800">{label}</span>
            </div>
          ))}
        </div>

        {/* table */}
        <div className="rounded-lg shadow border border-gray-300 overflow-hidden">
          <table className="table-fixed w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                {["วันที่ยื่น", "ประเภทการลา", "วันเริ่มต้น", "วันสิ้นสุด", "สถานะ"].map(
                  (h, i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayItems.length > 0 ? (
                displayItems.map((leave, idx) => {
                  const statusKey = (leave.status || "").toUpperCase();
                  return (
                    <tr
                      key={leave.id}
                      className={`${
                        idx % 2 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition cursor-pointer`}
                      onClick={() => navigate(`/leave/${leave.id}`)}
                    >
                      <td className="px-4 py-3">{formatDate(leave.createdAt)}</td>
                      <td className="px-4 py-3">
                        {leaveTypes[leave.leaveTypeId] || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[statusKey] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabels[statusKey] || leave.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    ไม่มีข้อมูลการลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-50 transition"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1 text-gray-800">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-50 transition"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>

      {/* floating button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* modal */}
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
