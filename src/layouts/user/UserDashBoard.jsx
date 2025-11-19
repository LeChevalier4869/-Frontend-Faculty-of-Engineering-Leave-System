import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  PlusCircle,
  List,
  XCircle,
  Briefcase,
  HeartPulse,
  User,
  Baby,
  Church,
  GraduationCap,
  Home,
  Accessibility,
  Flag,
  TreePalm,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import LeaveRequestModal from "./LeaveRequestModal";
import dayjs from "dayjs";
import "dayjs/locale/th";

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
    className={`rounded-2xl overflow-hidden bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
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

const SectionHeader = ({ eyebrow, title, description, right }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <div>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[11px] text-slate-200 uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-slate-50">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      )}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
);

export default function UserDashboard() {
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    remainingLeave: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [recent, setRecent] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const todayText = dayjs().locale("th").format("DD MMMM YYYY");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const [summaryRes, leavesRes] = await Promise.all([
          axios.get(getApiUrl("leave-balances/leave-summary"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(getApiUrl("leave-requests/my-requests"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const summary = summaryRes.data ?? {};
        const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : [];

        const approved = leaves.filter((r) => r.status === "APPROVED").length;
        const pending = leaves.filter((r) => r.status === "PENDING").length;
        const rejected = leaves.filter((r) => r.status === "REJECTED").length;

        setStats({
          approved,
          pending,
          rejected,
          remainingLeave: summary.remainingDays || 0,
        });

        const sorted = leaves
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecent(sorted.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }
        const res = await axios.get(apiEndpoints.getLeaveBalanceForMe, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntitlements(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลสิทธิลาการลาได้",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaveBalance();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(getApiUrl("leave-requests/me"), {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.leaveRequest)
          ? res.data.leaveRequest
          : [];
      setLeaveRequest(data);
    } catch (e) {
      console.error(e);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const pieData = [
    { name: statusLabels.APPROVED, key: "APPROVED", value: stats.approved },
    { name: statusLabels.PENDING, key: "PENDING", value: stats.pending },
    { name: statusLabels.REJECTED, key: "REJECTED", value: stats.rejected },
  ];

  const leaveTypeStats = leaveRequest.reduce((acc, leave) => {
    const type = leave.leaveType?.name || "อื่นๆ";
    acc[type] = acc[type] ? acc[type] + 1 : 1;
    return acc;
  }, {});
  const barData = Object.keys(leaveTypeStats).map((type) => ({
    name: type,
    value: leaveTypeStats[type],
  }));

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  if (loading || isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] text-slate-100 font-kanit px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/70 border border-sky-500/20 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-5">
          <div className="flex items-center gap-3 text-sm">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span>กำลังโหลดแดชบอร์ดของคุณ...</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] text-slate-100 font-kanit px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 mb-3 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-sky-100 tracking-[0.2em] uppercase">
                Leave Dashboard
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex">
                  <span
                    className="absolute inset-0 bg-sky-500/25 blur-xl opacity-70"
                    aria-hidden="true"
                  />
                  <span className="relative">
                    สวัสดีคุณ{" "}
                    <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                      {user?.firstName || ""} {user?.lastName || ""}
                    </span>
                  </span>
                </span>
                <span className="text-2xl md:text-3xl">👋</span>
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              ภาพรวมการลาของคุณในปีการทำงานนี้
            </p>
            <p className="mt-1 text-xs md:text-sm text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-300" />
              <span>วันนี้วันที่ {todayText}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-sky-500 text-white text-sm font-medium shadow-lg shadow-sky-500/40 hover:bg-sky-400 hover:-translate-y-0.5 hover:shadow-sky-400/60 transition-all duration-150"
            >
              <PlusCircle className="w-5 h-5" />
              ยื่นคำขอลา
            </button>
            <button
              onClick={() => navigate("/leave")}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white/5 border border-white/15 text-sm text-slate-100 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-150"
            >
              <List className="w-5 h-5" />
              ดูประวัติการลา
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            accent="sky"
            icon={
              <CalendarDays className="w-6 h-6 text-sky-300 drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]" />
            }
            label="วันลาคงเหลือทั้งหมด"
            value={stats.remainingLeave}
          />
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

        {/* Leave balance by type */}
        <Panel className="p-5">
          <SectionHeader
            eyebrow="Leave Balance"
            title="สิทธิลาการลาแยกตามประเภท"
            description="ดูจำนวนวันลาคงเหลือของคุณในแต่ละประเภทการลา"
          />
          {entitlements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {entitlements.map((item, idx) => (
                <div
                  key={item.leaveType?.id ?? `${item.leaveType?.name}-${idx}`}
                  className="rounded-2xl bg-slate-900/40 border border-slate-700/70 px-4 py-3 flex flex-col gap-1 hover:border-sky-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-400/40">
                        <CalendarDays className="w-4 h-4 text-sky-300" />
                      </span>
                      <span className="text-sm font-medium text-slate-100">
                        {item.leaveType?.name || "ประเภทการลา"}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-600/70">
                      คงเหลือ
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold text-sky-200">
                      {item.remainingDays}
                    </span>
                    <span className="text-xs text-slate-400">
                      วันลาคงเหลือ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-sm text-slate-300 text-center">
              ยังไม่มีข้อมูลสิทธิลาการลา
            </div>
          )}
        </Panel>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel className="p-6">
            <SectionHeader
              eyebrow="Status Overview"
              title="สัดส่วนสถานะคำขอลา"
              description="เปรียบเทียบสัดส่วนคำขอที่อนุมัติ รออนุมัติ และถูกปฏิเสธ"
            />
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
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeader
              eyebrow="Type Summary"
              title="จำนวนคำขอลาตามประเภท"
              description="เปรียบเทียบจำนวนคำขอตามประเภทการลา"
            />
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.25)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#e5e7eb"
                    tick={{ fontSize: 11 }}
                    height={60}
                    angle={-20}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis allowDecimals={false} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(148,163,184,0.4)",
                      borderRadius: "0.75rem",
                      color: "#e5e7eb",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill={COLORS.APPROVED}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Legend */}
        <Panel className="p-4">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(148,163,184,0.5)]"
                  style={{ backgroundColor: COLORS[key] }}
                />
                <span className="text-slate-100">{label}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Recent table */}
        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <SectionHeader
              eyebrow="Recent Activity"
              title="ประวัติการยื่นลาล่าสุด"
              description="รายการล่าสุด 5 รายการ คลิกที่แถวเพื่อดูรายละเอียดเพิ่มเติม"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="table-fixed w-full text-sm text-slate-100">
              <thead>
                <tr className="bg-white/5 border-y border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    วันที่ยื่น
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
                {recent.length > 0 ? (
                  recent.map((leave, idx) => {
                    const key = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id ?? idx}
                        className="border-b border-white/5 hover:bg-slate-800/60 transition cursor-pointer"
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDateTime(leave.createdAt)}
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${chipClass[key] ||
                              "bg-slate-500/20 text-slate-200 border border-slate-400/40"
                              }`}
                          >
                            {statusLabels[key] || leave.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-300"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <LeaveRequestModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchLeaveRequests();
          }}
        />
      </div>
    </div>
  );
}
