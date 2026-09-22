/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  PlusCircle,
  List,
  XCircle,
  CalendarDays,
  ChevronRight,
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
import { apiEndpoints, API } from "../../utils/api";
import { expandHolidays, defaultHolidayYears } from "../../utils/holidayUtils";
import Swal from "../../utils/alert";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import LeaveRequestModal from "./LeaveRequestModal";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  filterLeaveBalancesBySex,
  filterLeaveBalancesLatestYear,
} from "../../utils/leavePolicy";
import {
  formatLeaveDaysByUnit,
  leaveUnitForMaxDays,
} from "../../utils/formatLeaveDays";
import LoadingSpinner from "../../components/LoadingSpinner";
import PeriodFilter from "../../components/PeriodFilter";
import { filterByPeriod, DEFAULT_PERIOD } from "../../utils/periodRange";
import MiniCalendar, { buildLeaveCalendar } from "../../components/MiniCalendar";

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
  APPROVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200",
  REJECTED:
    "bg-rose-50 text-rose-700 border border-rose-200",
};

const VISIBLE_LEAVE_TYPES = ["ลาป่วย", "ลากิจส่วนตัว", "ลาพักผ่อน"];

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ icon, label, value, accent = "sky" }) => {
  const colorMap =
    {
      sky: {
        ring: "ring-brand-200",
        bg: "bg-brand-50",
        label: "text-slate-500",
        value: "text-slate-900",
      },
      emerald: {
        ring: "ring-emerald-200",
        bg: "bg-emerald-50",
        label: "text-emerald-600",
        value: "text-slate-900",
      },
      amber: {
        ring: "ring-amber-200",
        bg: "bg-amber-50",
        label: "text-amber-600",
        value: "text-slate-900",
      },
      rose: {
        ring: "ring-rose-200",
        bg: "bg-rose-50",
        label: "text-rose-600",
        value: "text-slate-900",
      },
    }[accent] ?? {
      ring: "ring-brand-200",
      bg: "bg-brand-50",
      label: "text-slate-500",
      value: "text-slate-900",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
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
  const [myLeaves, setMyLeaves] = useState([]);
  const [rawHolidays, setRawHolidays] = useState([]);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [upcoming, setUpcoming] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const todayText = dayjs().locale("th").format("DD MMMM YYYY");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const leavesRes = await axios.get(getApiUrl("leave-requests/my-requests"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
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
        const all = Array.isArray(res.data.data) ? res.data.data : [];
        const latestYearOnly = filterLeaveBalancesLatestYear(all);
        const bySex = filterLeaveBalancesBySex(latestYearOnly, user?.sex);
        const filtered = bySex.filter((item) =>
          VISIBLE_LEAVE_TYPES.includes(item.leaveType?.name)
        );
        setEntitlements(filtered);
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

  // ดึงวันหยุด + วันลาที่อนุมัติแล้ว เพื่อแสดง "ที่กำลังจะมาถึง" บน dashboard
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const [holidayRes, leaveRes] = await Promise.all([
          API.get(apiEndpoints.getHoliday),
          API.get(apiEndpoints.leaveRequestApprovedMe),
        ]);

        setRawHolidays(holidayRes.data.data || []);

        const holidays = expandHolidays(
          holidayRes.data.data || [],
          defaultHolidayYears()
        ).map((h) => ({
          kind: "holiday",
          title: h.description,
          date: h._date,
        }));
        const leaves = (Array.isArray(leaveRes.data) ? leaveRes.data : []).map(
          (l) => ({
            kind: "leave",
            title: l.leaveType?.name || "การลา",
            date: l.startDate,
            leaveId: l.id,
          })
        );

        const startOfToday = dayjs().startOf("day");
        const merged = [...holidays, ...leaves]
          .filter((e) => dayjs(e.date).isAfter(startOfToday.subtract(1, "day")))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        setUpcoming(merged);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUpcoming();
  }, []);

  // ---------- ข้อมูลตามช่วงเวลาที่เลือก (KPI/กราฟ) ----------
  const periodMyLeaves = useMemo(
    () => filterByPeriod(myLeaves, period),
    [myLeaves, period],
  );
  const stats = useMemo(
    () => ({
      approved: periodMyLeaves.filter((r) => r.status === "APPROVED").length,
      pending: periodMyLeaves.filter((r) => r.status === "PENDING").length,
      rejected: periodMyLeaves.filter((r) => r.status === "REJECTED").length,
    }),
    [periodMyLeaves],
  );
  // ประวัติล่าสุด: แสดงภาพรวม (ไม่กรองช่วง) เหมือน dashboard อื่น
  const recent = useMemo(
    () =>
      [...myLeaves]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [myLeaves],
  );
  // ปฏิทินเดือนนี้: แสดงวันลาของคุณ + วันหยุด (คงเป็นภาพรวมเดือนปัจจุบัน)
  const calendar = useMemo(
    () => buildLeaveCalendar(leaveRequest, rawHolidays),
    [leaveRequest, rawHolidays],
  );

  const pieData = [
    { name: statusLabels.APPROVED, key: "APPROVED", value: stats.approved },
    { name: statusLabels.PENDING, key: "PENDING", value: stats.pending },
    { name: statusLabels.REJECTED, key: "REJECTED", value: stats.rejected },
  ];

  const periodLeaveRequest = useMemo(
    () => filterByPeriod(leaveRequest, period),
    [leaveRequest, period],
  );
  const approvedLeaveRequests = periodLeaveRequest.filter(
    (leave) => leave.status === "APPROVED",
  );

  const leaveTypeStats = approvedLeaveRequests.reduce((acc, leave) => {
    const type = leave.leaveType?.name;
    if (!type) return acc;
    if (!VISIBLE_LEAVE_TYPES.includes(type)) return acc;
    
    if (!acc[type]) {
      acc[type] = { count: 0, days: 0 };
    }
    acc[type].count += 1;
    acc[type].days += leave.leavedDays || 0;
    return acc;
  }, {});
  
  const barData = VISIBLE_LEAVE_TYPES.map((type) => ({
    name: type,
    จำนวนครั้ง: leaveTypeStats[type]?.count || 0,
    จำนวนวัน: leaveTypeStats[type]?.days || 0,
  }));

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  if (loading || isLoading)
    return <LoadingSpinner message="กำลังโหลดแดชบอร์ดของคุณ..." fullScreen={false} />;

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-kanit px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-brand-700 tracking-[0.2em] uppercase">
                Leave Dashboard
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex">
                  <span
                    className="absolute inset-0 bg-brand-100 blur-xl opacity-70"
                    aria-hidden="true"
                  />
                  <span className="relative">
                    สวัสดีคุณ{" "}
                    <span className="text-brand-700 font-bold">
                      {user?.firstName || ""} {user?.lastName || ""}
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              ภาพรวมการลาของคุณในปีการทำงานนี้
            </p>
            <p className="mt-1 text-xs md:text-sm text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>วันนี้ วันที่ {todayText}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-brand-600 text-white text-sm font-medium shadow-sm hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-150"
            >
              <PlusCircle className="w-5 h-5" />
              ยื่นคำขอลา
            </button>
            <button
              onClick={() => navigate("/leave")}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-150"
            >
              <List className="w-5 h-5 text-slate-600" />
              ดูประวัติการลา
            </button>
          </div>
        </div>

        {/* ตัวกรองช่วงเวลา — มีผลกับสถิติ/กราฟด้านล่าง (ปฏิทินและประวัติล่าสุดยังเป็นภาพรวม) */}
        <Panel className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              ช่วงเวลาข้อมูลสรุป
            </h2>
            <p className="text-xs text-slate-500">
              เลือกช่วงเพื่อดูสถิติและกราฟการลาของคุณเฉพาะช่วงนั้น
            </p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} className="sm:items-end" />
        </Panel>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            accent="emerald"
            icon={
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            }
            label={statusLabels.APPROVED}
            value={stats.approved}
          />
          <StatCard
            accent="amber"
            icon={
              <Clock className="w-6 h-6 text-amber-500" />
            }
            label={statusLabels.PENDING}
            value={stats.pending}
          />
          <StatCard
            accent="rose"
            icon={
              <XCircle className="w-6 h-6 text-rose-500" />
            }
            label={statusLabels.REJECTED}
            value={stats.rejected}
          />
        </div>

        <Panel className="p-5">
          <SectionHeader
            eyebrow="Leave Balance"
            title="สิทธิลาการลาแยกตามประเภท"
            description="ดูจำนวนวันลาคงเหลือของคุณในแต่ละประเภทการลา"
            right={
              <button
                onClick={() => navigate("/leave/balance")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition-colors"
              >
                <List className="w-4 h-4" />
                ดูทั้งหมด
              </button>
            }
          />
          {entitlements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {entitlements.map((item, index) => {
                // หน่วยตามสิทธิ์รวม: เกิน 1 ปี → "ปี" ไม่เกิน → "วัน" (ไม่มีเดือน)
                const unit = leaveUnitForMaxDays(item.maxDays);
                const remainingNum = Number(item.remainingDays) || 0;
                const overused = remainingNum < 0;
                const remainingDisplay = {
                  text: overused
                    ? `เกิน ${formatLeaveDaysByUnit(Math.abs(remainingNum), unit)}`
                    : formatLeaveDaysByUnit(remainingNum, unit),
                  className: overused
                    ? "text-rose-600 font-bold"
                    : "text-emerald-600 font-bold",
                };
                return (
                  <div
                    key={item.id ?? index}
                    className="rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {item.leaveType?.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        คงเหลือ
                      </span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`block whitespace-nowrap text-xl font-semibold leading-tight ${remainingDisplay.className}`}
                        title={remainingDisplay.text}
                      >
                        {remainingDisplay.text}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        วันลาคงเหลือ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-sm text-slate-500 text-center">
              ยังไม่มีข้อมูลสิทธิลาการลา
            </div>
          )}
        </Panel>

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
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      color: "#0f172a",
                    }}
                  />
                  <Legend />
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
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    height={60}
                    angle={-20}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      color: "#0f172a",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="จำนวนครั้ง"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Bar
                    dataKey="จำนวนวัน"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel className="p-4">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-[0_0_6px_rgba(148,163,184,0.6)]"
                  style={{ backgroundColor: COLORS[key] }}
                />
                <span className="text-slate-800">{label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="Calendar"
            title="ปฏิทินการลาเดือนนี้"
            description="ไฮไลต์วันลาของคุณและวันหยุดในเดือนปัจจุบัน"
            right={
              <button
                onClick={() => navigate("/Calendar")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition"
              >
                <CalendarDays className="w-4 h-4" />
                ดูทั้งหมด
              </button>
            }
          />
          <MiniCalendar
            cal={calendar}
            countBadge={false}
            leaveLegendLabel="วันลาของคุณ"
            leaveTooltip={() => "วันลาของคุณ"}
          />
        </Panel>

        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
            <SectionHeader
              eyebrow="Upcoming"
              title="วันหยุด & วันลาที่กำลังจะมาถึง"
              description="รายการถัดไป 5 รายการ"
            />
            <button
              onClick={() => navigate("/Calendar")}
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition"
            >
              <CalendarDays className="w-4 h-4" />
              ดูปฏิทินทั้งหมด
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            {upcoming.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {upcoming.map((e, idx) => (
                  <li
                    key={idx}
                    onClick={() =>
                      e.kind === "leave" && e.leaveId
                        ? navigate(`/leave/${e.leaveId}`)
                        : navigate("/Calendar")
                    }
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition"
                  >
                    <span
                      className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                        e.kind === "leave" ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {e.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {e.kind === "leave" ? "วันลาของคุณ" : "วันหยุด"}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-sm text-slate-600 whitespace-nowrap">
                      {dayjs(e.date).locale("th").format("DD MMM")}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                ไม่มีวันหยุดหรือวันลาที่กำลังจะมาถึง
              </p>
            )}
          </div>
        </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <SectionHeader
              eyebrow="Recent Activity"
              title="ประวัติการยื่นลาล่าสุด"
              description="รายการล่าสุด 5 รายการ คลิกที่แถวเพื่อดูรายละเอียดเพิ่มเติม"
            />
          </div>
          {/* Desktop: ตาราง */}
          <div className="overflow-x-auto hidden md:block">
            <table className="table-fixed w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    วันที่ยื่น
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    วันเริ่มต้น
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    วันสิ้นสุด
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.16em] text-slate-500">
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
                        className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer"
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              chipClass[key] ||
                              "bg-slate-100 text-slate-700 border border-slate-200"
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
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: การ์ด */}
          <div className="md:hidden divide-y divide-slate-100">
            {recent.length > 0 ? (
              recent.map((leave, idx) => {
                const key = (leave.status || "").toUpperCase();
                return (
                  <button
                    key={leave.id ?? idx}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {leave.leaveType?.name || "-"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          chipClass[key] ||
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {statusLabels[key] || leave.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      ยื่นเมื่อ {formatDateTime(leave.createdAt)}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-500">
                ไม่มีข้อมูลการลา
              </div>
            )}
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
