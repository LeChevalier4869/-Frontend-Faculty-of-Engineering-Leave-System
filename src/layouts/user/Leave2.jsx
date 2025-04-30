import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import LeaveRequestModal from "./LeaveRequestModal";
import { apiEndpoints } from "../../utils/api";

const PAGE_SIZE = 8;

export default function Leave2() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});

  // default filterDate to today
  const today = dayjs().format("YYYY-MM-DD");
  const [filterDate, setFilterDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");

  const statusLabels = {
    APPROVED: "อนุมัติแล้ว",
    PENDING:  "รออนุมัติ",
    REJECTED: "ปฏิเสธ",
    CANCELLED: "ยกเลิก",
  };
  const statusColors = {
    APPROVED:  "bg-green-500 text-white",
    PENDING:   "bg-yellow-500 text-white",
    REJECTED:  "bg-red-500 text-white",
    CANCELLED: "bg-gray-500 text-white",
  };

  // fetch user's own leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(getApiUrl("leave-requests/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.leaveRequest)
        ? res.data.leaveRequest
        : [];
      setLeaveRequest(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch available leave types for mapping id → name
  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(apiEndpoints.availableLeaveType);
      const map = {};
      (res.data.data || []).forEach((lt) => {
        map[lt.id] = lt.name;
      });
      setLeaveTypesMap(map);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY");

  // combined filters: date, status, leaveType
  const filtered = useMemo(() => {
    return leaveRequest.filter((lr) => {
      const byDate = dayjs(lr.createdAt).format("YYYY-MM-DD") === filterDate;
      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType ? String(lr.leaveTypeId) === filterLeaveType : true;
      return byDate && byStatus && byType;
    });
  }, [leaveRequest, filterDate, filterStatus, filterLeaveType]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
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

        {/* filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">สถานะทั้งหมด</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={filterLeaveType}
            onChange={(e) => { setFilterLeaveType(e.target.value); setCurrentPage(1); }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">ประเภทการลาทั้งหมด</option>
            {Object.entries(leaveTypesMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => { setFilterDate(today); setFilterStatus(""); setFilterLeaveType(""); setCurrentPage(1); }}
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
                {[
                  "วันที่ยื่น",
                  "ประเภทการลา",
                  "วันเริ่มต้น",
                  "วันสิ้นสุด",
                  "สถานะ",
                ].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.length > 0 ? displayItems.map((leave, idx) => {
                const statusKey = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-3">{formatDate(leave.createdAt)}</td>
                    <td className="px-4 py-3">{leaveTypesMap[leave.leaveTypeId] || "-"}</td>
                    <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[statusKey] || "bg-gray-100 text-gray-700"}`}>{statusLabels[statusKey] || leave.status}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">ไม่มีข้อมูลการลา</td></tr>
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
            >ก่อนหน้า</button>
            <span className="px-3 py-1 text-gray-800">หน้า {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-50 transition"
            >ถัดไป</button>
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

      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchLeaveRequests(); }}
      />
    </div>
  );
}
