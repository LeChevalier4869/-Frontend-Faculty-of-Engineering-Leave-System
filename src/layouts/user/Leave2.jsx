import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";
import { Plus, ChevronDown, Download, Clock } from "lucide-react";
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
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border border-slate-200",
};

const statusDotClass = {
  APPROVED: "bg-emerald-400",
  PENDING: "bg-amber-400",
  REJECTED: "bg-rose-400",
  CANCELLED: "bg-slate-400",
};

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ eyebrow, title, description, right }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <div>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
);

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
  const [currentPage, setCurrentPage] = useState(1);

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
      console.error("Error fetching Google Drive link:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(apiEndpoints.getAllLeaveTypes);
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
        byDate = dayjs(created).isBetween(filterStartDate, filterEndDate, null, "[]");
      } else if (filterStartDate) {
        byDate = created >= filterStartDate;
      } else if (filterEndDate) {
        byDate = created <= filterEndDate;
      }

      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType ? String(lr.leaveTypeId) === filterLeaveType : true;

      return byDate && byStatus && byType;
    });
  }, [leaveRequest, filterStartDate, filterEndDate, filterStatus, filterLeaveType, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 text-slate-800 font-kanit">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="text-slate-800 font-medium">กำลังโหลดข้อมูลการลา...</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-sky-500" />
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลของคุณ
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-kanit px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-sky-700 tracking-[0.2em] uppercase">
                Leave Records
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              รายการการลาของคุณ
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ตรวจสอบประวัติการลา ค้นหาตามช่วงเวลาและสถานะได้จากที่นี่
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => driveUrl && window.open(driveUrl, "_blank")}
              disabled={!driveUrl}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              ดาวน์โหลดใบลา
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-sky-500 text-white text-sm font-medium shadow-sm hover:bg-sky-400 hover:-translate-y-0.5 transition-all duration-150"
            >
              <Plus className="w-5 h-5" />
              ยื่นลา
            </button>
          </div>
        </div>

        <Panel className="p-5 space-y-4">
          <SectionHeader
            eyebrow="Filters"
            title="ค้นหาและกรองรายการลา"
            description="เลือกช่วงวันที่ สถานะ และประเภทการลาเพื่อค้นหารายการที่ต้องการ"
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">จาก</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              />
              <span className="text-xs text-slate-500">ถึง</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              />
            </div>

            <div className="relative w-48">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-slate-800 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
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
                className="w-full bg-white text-slate-800 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
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
                className="w-full bg-white text-slate-800 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
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
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-sm font-medium text-white shadow-sm hover:-translate-y-0.5 transition-all duration-150"
            >
              ล้างตัวกรอง
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center text-xs md:text-sm text-slate-600">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full shadow ${statusDotClass[key]}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <SectionHeader
              eyebrow="Leave History"
              title="ประวัติการยื่นลาของคุณ"
              description="คลิกที่แถวเพื่อดูรายละเอียดคำขอลาแต่ละรายการ"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  {["วันที่ยื่น", "ประเภทการลา", "วันเริ่มต้น", "วันสิ้นสุด", "สถานะ"].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold"
                      >
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
                        key={leave.id ?? idx}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
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
                              "bg-slate-100 text-slate-700 border border-slate-200"
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
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500 text-sm"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                ก่อนหน้า
              </button>
              <span className="text-xs text-slate-600">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                ถัดไป
              </button>
            </div>
          )}
        </Panel>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 bg-sky-500 hover:bg-sky-400 text-white p-4 rounded-full shadow-xl shadow-sky-300/60 hover:-translate-y-0.5 transition-all duration-150"
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
