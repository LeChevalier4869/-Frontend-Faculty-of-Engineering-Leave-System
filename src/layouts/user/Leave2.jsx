import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Plus,
  ChevronDown,
  Download,
} from "lucide-react";
import LeaveRequestModal from "./LeaveRequestModal";
import { apiEndpoints } from "../../utils/api";

dayjs.extend(isBetween);

const PAGE_SIZE = 10;

const statusLabels = {
  APPROVED: "อนุมัติแล้ว",
  PENDING: "รออนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
};

const statusChipClass = {
  APPROVED: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40",
  PENDING: "bg-amber-500/15 text-amber-300 border border-amber-400/40",
  REJECTED: "bg-rose-500/15 text-rose-300 border border-rose-400/40",
  CANCELLED: "bg-slate-500/20 text-slate-200 border border-slate-400/40",
};

const statusDotClass = {
  APPROVED: "bg-emerald-400",
  PENDING: "bg-amber-400",
  REJECTED: "bg-rose-400",
  CANCELLED: "bg-slate-400",
};

export default function Leave2() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [driveUrl, setDriveUrl] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(apiEndpoints.leaveRequestMe, {
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

  const fetchGoogleDriveLink = async () => {
    try {
      const res = await axios.get(apiEndpoints.getDriveLink);
      setDriveUrl(res.data.url);
    } catch (err) {
      console.error("Error fetching Google Link:", err);
    }
  };

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
    fetchGoogleDriveLink();
  }, []);

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  const filtered = useMemo(() => {
    const sorted = [...leaveRequest].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");
      let byDate = true;

      if (filterStartDate && filterEndDate) {
        byDate = dayjs(created).isBetween(
          filterStartDate,
          filterEndDate,
          null,
          "[]"
        );
      } else if (filterStartDate) {
        byDate = created >= filterStartDate;
      } else if (filterEndDate) {
        byDate = created <= filterEndDate;
      }

      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType
        ? String(lr.leaveTypeId) === filterLeaveType
        : true;

      return byDate && byStatus && byType;
    });
  }, [
    leaveRequest,
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterLeaveType,
    sortOrder,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="font-medium">กำลังโหลดข้อมูลการลา...</span>
            <span className="text-xs text-slate-400">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลของคุณ
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] text-slate-100 font-kanit px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 mb-3 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-sky-100 tracking-[0.2em] uppercase">
                Leave Records
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              รายการการลาของคุณ
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              ตรวจสอบประวัติการลา ค้นหาตามช่วงเวลาและสถานะได้จากที่นี่
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => driveUrl && window.open(driveUrl, "_blank")}
              disabled={!driveUrl}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-emerald-400/60 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              ดาวน์โหลดใบลา
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-sky-500 text-white text-sm font-medium shadow-lg shadow-sky-500/40 hover:bg-sky-400 hover:-translate-y-0.5 hover:shadow-sky-400/60 transition-all duration-150"
            >
              <Plus className="w-5 h-5" />
              ยื่นลา
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">จาก</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-900/80 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              />
              <span className="text-xs text-slate-300">ถึง</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-900/80 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              />
            </div>

            <div className="relative w-48">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-900/80 text-slate-100 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              >
                <option value="">สถานะทั้งหมด</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="relative w-56">
              <select
                value={filterLeaveType}
                onChange={(e) => {
                  setFilterLeaveType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-900/80 text-slate-100 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              >
                <option value="">ประเภทการลาทั้งหมด</option>
                {Object.entries(leaveTypesMap).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="relative w-48">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-slate-900/80 text-slate-100 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              >
                <option value="desc">เรียงจากใหม่ไปเก่า</option>
                <option value="asc">เรียงจากเก่าไปใหม่</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
                setFilterStatus("");
                setFilterLeaveType("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-rose-500/90 hover:bg-rose-400 text-sm font-medium text-white shadow hover:-translate-y-0.5 transition-all duration-150"
            >
              ล้างตัวกรอง
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center text-xs md:text-sm text-slate-200">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full shadow ${statusDotClass[key]}`}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm text-slate-100">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  {[
                    "วันที่ยื่น",
                    "ประเภทการลา",
                    "วันเริ่มต้น",
                    "วันสิ้นสุด",
                    "สถานะ",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayItems.length > 0 ? (
                  displayItems.map((leave, idx) => {
                    const statusKey = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id ?? idx}
                        className={`border-b border-white/5 hover:bg-slate-800/70 transition cursor-pointer ${
                          idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                        }`}
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDateTime(leave.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {leaveTypesMap[leave.leaveTypeId] || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusChipClass[statusKey] ||
                              "bg-slate-500/20 text-slate-200 border border-slate-400/40"
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
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-300"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 bg-slate-900/80 border-t border-white/10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600 text-xs text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/90 transition"
              >
                ก่อนหน้า
              </button>
              <span className="text-xs text-slate-300">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600 text-xs text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/90 transition"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 bg-sky-500 hover:bg-sky-400 text-white p-4 rounded-full shadow-xl shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-150"
      >
        <Plus className="w-6 h-6" />
      </button>

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
