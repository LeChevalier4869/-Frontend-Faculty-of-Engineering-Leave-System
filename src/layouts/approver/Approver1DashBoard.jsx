import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Filter } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const COLORS = {
  APPROVED: "#22c55e",
  PENDING: "#facc15",
  REJECTED: "#ef4444",
};

const statusLabels = {
  APPROVED: "อนุมัติแล้ว",
  PENDING: "รออนุมัติ",
  REJECTED: "ปฏิเสธแล้ว",
};

const chipClass = {
  APPROVED: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40",
  PENDING: "bg-amber-500/15 text-amber-300 border border-amber-400/40",
  REJECTED: "bg-rose-500/15 text-rose-300 border border-rose-400/40",
};

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl overflow-hidden bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ icon, label, value, accent = "sky" }) => {
  const colorMap =
    {
      sky: {
        ring: "ring-sky-400/40",
        bg: "bg-sky-500/10",
        label: "text-slate-300",
        value: "text-slate-50",
      },
      emerald: {
        ring: "ring-emerald-400/40",
        bg: "bg-emerald-500/10",
        label: "text-emerald-200",
        value: "text-emerald-50",
      },
      amber: {
        ring: "ring-amber-400/40",
        bg: "bg-amber-500/10",
        label: "text-amber-200",
        value: "text-amber-50",
      },
      rose: {
        ring: "ring-rose-400/40",
        bg: "bg-rose-500/10",
        label: "text-rose-200",
        value: "text-rose-50",
      },
    }[accent] ?? {
      ring: "ring-sky-400/40",
      bg: "bg-sky-500/10",
      label: "text-slate-300",
      value: "text-slate-50",
    };

  return (
    <Panel className="p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl ${colorMap.bg} flex items-center justify-center ring-1 ${colorMap.ring}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-xs uppercase tracking-[0.16em] ${colorMap.label}`}>
          {label}
        </div>
        <div className={`mt-1 text-3xl font-semibold tracking-tight ${colorMap.value}`}>
          {value}
        </div>
      </div>
    </Panel>
  );
};

export default function Approver1DashBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);

  // 🔍 Filter state
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLeaveType, setFilterLeaveType] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    const fetchApproverRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(getApiUrl("leave-requests/for-approver1"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error("Approver fetch error:", err.response || err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลคำขอลาได้",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApproverRequests();
  }, []);

  // 🔧 Unique leave types for dropdown
  const leaveTypeOptions = useMemo(() => {
    const map = new Map();
    leaveRequests.forEach((r) => {
      if (r.leaveType) {
        const key = String(r.leaveType.id ?? r.leaveType.name);
        if (!map.has(key)) {
          map.set(key, {
            key,
            name: r.leaveType.name,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [leaveRequests]);

  // 🧮 Apply filters
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      const statusKey = (r.status || "").toUpperCase();

      const statusMatch =
        filterStatus === "ALL" || filterStatus === "" || statusKey === filterStatus;

      const typeKey = String(r.leaveType?.id ?? r.leaveType?.name ?? "");
      const typeMatch =
        filterLeaveType === "ALL" || filterLeaveType === "" || typeKey === filterLeaveType;

      const startMatch = filterStartDate
        ? dayjs(r.startDate).isSameOrAfter(dayjs(filterStartDate), "day")
        : true;

      const endMatch = filterEndDate
        ? dayjs(r.endDate).isSameOrBefore(dayjs(filterEndDate), "day")
        : true;

      return statusMatch && typeMatch && startMatch && endMatch;
    });
  }, [leaveRequests, filterStatus, filterLeaveType, filterStartDate, filterEndDate]);

  const stats = {
    approved: filteredRequests.filter((r) => r.status === "APPROVED").length,
    pending: filteredRequests.filter((r) => r.status === "PENDING").length,
    rejected: filteredRequests.filter((r) => r.status === "REJECTED").length,
  };

  const pieData = [
    { name: statusLabels.APPROVED, key: "APPROVED", value: stats.approved },
    { name: statusLabels.PENDING, key: "PENDING", value: stats.pending },
    { name: statusLabels.REJECTED, key: "REJECTED", value: stats.rejected },
  ];

  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");
  const formatDateTime = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  const resetFilters = () => {
    setFilterStatus("ALL");
    setFilterLeaveType("ALL");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="font-medium">กำลังโหลดแดชบอร์ดผู้อนุมัติ...</span>
            <span className="text-xs text-slate-400">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลคำขอลาที่ต้องพิจารณา
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100 px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.35)] mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-100">
                Approver Dashboard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex">
                  <span className="absolute inset-0 bg-emerald-500/25 blur-xl opacity-70" />
                  <span className="relative">
                    แดชบอร์ดผู้อนุมัติ{" "}
                    <span className="bg-gradient-to-r from-emerald-300 via-cyan-200 to-sky-200 bg-clip-text text-transparent">
                      สวัสดีคุณ {user?.firstName} {user?.lastName}
                    </span>
                  </span>
                </span>
                <span className="text-2xl md:text-3xl">👋</span>
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              ภาพรวมคำขอลาที่คุณมีหน้าที่พิจารณาในช่วงนี้
            </p>
          </div>
        </div>

        {/* 🔍 Filter Bar */}
        <Panel className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <div className="w-9 h-9 rounded-2xl bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-400/40">
                <Filter className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  ตัวกรองคำขอลา
                </div>
                <div className="text-sm text-slate-100">
                  แสดง {filteredRequests.length} รายการ จากทั้งหมด {leaveRequests.length} รายการ
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-auto">
              {/* Status filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  สถานะ
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-900/70 border border-sky-500/30 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                >
                  <option value="ALL">ทั้งหมด</option>
                  <option value="PENDING">รออนุมัติ</option>
                  <option value="APPROVED">อนุมัติแล้ว</option>
                  <option value="REJECTED">ปฏิเสธแล้ว</option>
                </select>
              </div>

              {/* Leave type filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  ประเภทการลา
                </label>
                <select
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value)}
                  className="bg-slate-900/70 border border-sky-500/30 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                >
                  <option value="ALL">ทั้งหมด</option>
                  {leaveTypeOptions.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start date */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  จากวันที่ (วันเริ่มต้น)
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-slate-900/70 border border-sky-500/30 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                />
              </div>

              {/* End date + reset button */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.16em] text-slate-400 flex items-center justify-between">
                  ถึงวันที่ (วันสิ้นสุด)
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[10px] text-sky-300 hover:text-sky-200 underline underline-offset-2"
                  >
                    ล้างตัวกรอง
                  </button>
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-slate-900/70 border border-sky-500/30 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            accent="emerald"
            icon={
              <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
            }
            label={statusLabels.APPROVED}
            value={stats.approved}
          />
          <StatCard
            accent="amber"
            icon={
              <Clock className="w-6 h-6 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,0.8)]" />
            }
            label={statusLabels.PENDING}
            value={stats.pending}
          />
          <StatCard
            accent="rose"
            icon={
              <XCircle className="w-6 h-6 text-rose-400 drop-shadow-[0_0_14px_rgba(248,113,113,0.8)]" />
            }
            label={statusLabels.REJECTED}
            value={stats.rejected}
          />
        </div>

        {/* Pie chart */}
        <Panel className="p-6">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-50 mb-4">
            สัดส่วนสถานะคำขอลา
          </h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((d) => (
                    <Cell key={d.key} fill={COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(148,163,184,0.4)",
                    borderRadius: "0.75rem",
                    color: "#e5e7eb",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#e5e7eb" }}
                  formatter={(value) => (
                    <span className="text-slate-100 text-xs md:text-sm">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Table */}
        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-50">
              รายการคำขอที่ต้องพิจารณา
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              คลิกที่แถวเพื่อเปิดหน้ารายละเอียดและดำเนินการอนุมัติ/ปฏิเสธ
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-fixed w-full text-sm text-slate-100">
              <thead>
                <tr className="bg-white/5 border-y border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    วันที่ยื่น
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    ชื่อผู้ยื่น
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    วันเริ่มต้น
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    วันสิ้นสุด
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((leave, idx) => {
                    const statusKey = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id ?? idx}
                        className="border-b border-white/5 hover:bg-slate-800/60 transition cursor-pointer"
                        onClick={() => navigate(`/approver/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDateTime(leave.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {leave.user?.firstName} {leave.user?.lastName}
                        </td>
                        <td className="px-4 py-3">
                          {leave.leaveType?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              chipClass[statusKey] ||
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
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-300"
                    >
                      ไม่มีคำขออนุมัติที่ตรงกับตัวกรองในขณะนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
