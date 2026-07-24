/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  History,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { API } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";

/**
 * สีสถานะ — ผ่านการตรวจ contrast (>= 3:1 บนพื้นขาว) แล้ว
 * คู่ "อนุมัติ/ปฏิเสธ" มีระยะสีต่ำสำหรับผู้มีภาวะตาบอดสีแดง-เขียว
 * จึงต้องแสดง "ไอคอน + ข้อความ + ตัวเลข" ควบคู่เสมอ ห้ามสื่อด้วยสีอย่างเดียว
 */
const STATUS_META = {
  PENDING: { label: "รออนุมัติ", color: "#d97706", Icon: Clock },
  APPROVED: { label: "อนุมัติแล้ว", color: "#059669", Icon: CheckCircle2 },
  REJECTED: { label: "ถูกปฏิเสธ", color: "#e11d48", Icon: XCircle },
  CANCELLED: { label: "ยกเลิก", color: "#64748b", Icon: Ban },
};
const STATUS_ORDER = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const CHART_PRIMARY = "#b23a47"; // brand-500
const CHART_ACCENT = "#a8842f"; // gold-dark

// ตำแหน่งในสายอนุมัติตามระดับ (ใช้กับการมอบอำนาจ)
const LEVEL_ROLE_LABEL = {
  1: "หัวหน้าสาขา",
  2: "ผู้ตรวจสอบ",
  3: "สารบรรณคณะ",
  4: "รองคณบดี",
  5: "คณบดี",
};

const TH_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const AUDIT_ACTION_TH = {
  CREATE: "สร้าง",
  UPDATE: "แก้ไข",
  DELETE: "ลบ",
  APPROVE: "อนุมัติ",
  REJECT: "ปฏิเสธ",
  CANCEL: "ยกเลิก",
  LOGIN: "เข้าสู่ระบบ",
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : "-";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const fullName = (u) =>
  u ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim() : "-";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [proxyToday, setProxyToday] = useState(0);
  const [proxies, setProxies] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [approvers, setApprovers] = useState([]);

  const loadAll = useCallback(async () => {
    setError("");
    // ยิงแยกกันและกันพังทีละตัว — ถ้า endpoint ใดล้ม ส่วนที่เหลือยังแสดงได้
    const [reqRes, userRes, auditRes, proxyRes, holidayRes, approverRes] =
      await Promise.all([
        API.get("/leave-requests").catch(() => null),
        API.get("/admin/users").catch(() => null),
        API.get("/admin/audit-logs", { params: { limit: 6 } }).catch(() => null),
        API.get("/proxy-approval/today").catch(() => null),
        API.get("/admin/holiday").catch(() => null),
        API.get("/admin/approver-positions").catch(() => null),
      ]);

    if (!reqRes && !userRes) {
      setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองใหม่อีกครั้ง");
    }

    setRequests(reqRes?.data?.data || []);
    setUserCount((userRes?.data?.data || []).length);
    setAuditLogs(auditRes?.data?.data || []);
    setProxyToday(proxyRes?.data?.pagination?.totalCount ?? (proxyRes?.data?.data || []).length);
    setProxies(proxyRes?.data?.data || []);
    setHolidays(holidayRes?.data?.data || []);
    setApprovers(approverRes?.data?.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // ---------- ข้อมูลสรุป (คำนวณฝั่ง client เพราะ backend ยังไม่มี endpoint สรุป) ----------
  const statusCounts = useMemo(() => {
    const base = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    for (const r of requests) if (r.status in base) base[r.status] += 1;
    return base;
  }, [requests]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: TH_MONTHS[d.getMonth()],
        จำนวนคำขอ: 0,
      });
    }
    const index = new Map(buckets.map((b) => [b.key, b]));
    for (const r of requests) {
      if (!r.createdAt) continue;
      const d = new Date(r.createdAt);
      const hit = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (hit) hit.จำนวนคำขอ += 1;
    }
    return buckets;
  }, [requests]);

  const topLeaveTypes = useMemo(() => {
    const tally = new Map();
    for (const r of requests) {
      const name = r.leaveType?.name || "ไม่ระบุ";
      tally.set(name, (tally.get(name) || 0) + 1);
    }
    return [...tally.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [requests]);

  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [requests],
  );

  // อันดับผู้ลาเยอะสุด (ทั้งระบบ) — รวมจำนวนวันและครั้ง (อนุมัติ/รออนุมัติ) เอา 10 อันดับแรก
  const topLeavers = useMemo(() => {
    const tally = new Map();
    for (const r of requests) {
      if (r.status === "REJECTED" || r.status === "CANCELLED") continue;
      const u = r.user;
      if (!u) continue;
      const cur = tally.get(u.id) || { user: u, days: 0, count: 0 };
      cur.days += Number(r.thisTimeDays) || 0;
      cur.count += 1;
      tally.set(u.id, cur);
    }
    return [...tally.values()]
      .sort((a, b) => b.days - a.days || b.count - a.count)
      .slice(0, 10);
  }, [requests]);

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays
      .filter((h) => h.date && new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [holidays]);

  const maxTypeCount = topLeaveTypes[0]?.count || 1;
  const totalRequests = requests.length;

  if (loading) {
    return (
      <LoadingSpinner
        message="กำลังโหลดแดชบอร์ดผู้ดูแลระบบ..."
        fullScreen={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">
                Admin Dashboard
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
              ภาพรวมระบบการลา
            </h1>
            <p className="text-sm text-slate-600">
              ข้อมูล ณ{" "}
              {new Date().toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "กำลังรีเฟรช..." : "รีเฟรชข้อมูล"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ---------- KPI ---------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="ผู้ใช้งานทั้งหมด"
            value={userCount}
            hint="ดูรายชื่อผู้ใช้งาน"
            onClick={() =>
              navigate("/admin/management", { state: { activeTab: "users" } })
            }
          />
          <StatTile
            icon={<FileText className="h-5 w-5" />}
            label="คำขอลาทั้งหมด"
            value={totalRequests}
            hint="ดูคำขอทั้งหมด"
            onClick={() =>
              navigate("/admin/management", {
                state: { activeTab: "leaveRequests" },
              })
            }
          />
          <StatTile
            icon={<Clock className="h-5 w-5" />}
            label="รออนุมัติ"
            value={statusCounts.PENDING}
            accent={statusCounts.PENDING > 0}
            hint={
              statusCounts.PENDING > 0 ? "มีรายการรอดำเนินการ" : "ไม่มีรายการค้าง"
            }
            onClick={() =>
              navigate("/admin/management", {
                state: { activeTab: "leaveRequests" },
              })
            }
          />
          <StatTile
            icon={<ShieldCheck className="h-5 w-5" />}
            label="มอบอำนาจที่ใช้งานวันนี้"
            value={proxyToday}
            hint="จัดการการมอบอำนาจ"
            onClick={() =>
              navigate("/admin/management", { state: { activeTab: "proxy" } })
            }
          />
        </div>

        {/* ---------- ผู้อนุมัติระดับคณะปัจจุบัน ---------- */}
        <Panel
          title="ผู้อนุมัติระดับคณะปัจจุบัน"
          subtitle="ผู้ดำรงตำแหน่งในสายอนุมัติของคณะ (ตามทะเบียนผู้อนุมัติ)"
          action={
            <PanelLink
              to="/admin/management"
              state={{ activeTab: "approvers" }}
              label="จัดการผู้อนุมัติ"
            />
          }
        >
          {approvers.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูลผู้อนุมัติ" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {approvers.map((a) => (
                <div
                  key={a.level}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      {a.label}
                    </span>
                    {!a.inSync && (
                      <span
                        title="ทะเบียนผู้อนุมัติไม่ตรงกับผู้ถือสิทธิ์จริง ควรตรวจสอบ"
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        ตรวจสอบ
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-2 truncate text-sm font-semibold text-slate-900"
                    title={a.holder ? fullName(a.holder) : ""}
                  >
                    {a.holder ? fullName(a.holder) : "— ยังไม่กำหนด"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {a.holder?.department?.name || a.holder?.email || " "}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ---------- ผู้รับมอบอำนาจที่ใช้งานวันนี้ ---------- */}
        <Panel
          title="ผู้รับมอบอำนาจที่ใช้งานวันนี้"
          subtitle={`มีการมอบอำนาจที่ใช้งานอยู่ ${proxyToday} รายการ`}
          action={
            <PanelLink
              to="/admin/management"
              state={{ activeTab: "proxy" }}
              label="จัดการการมอบอำนาจ"
            />
          }
        >
          {proxies.length === 0 ? (
            <EmptyState text="วันนี้ไม่มีการมอบอำนาจที่ใช้งานอยู่" />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {proxies.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="min-w-0 truncate font-medium text-slate-800"
                      title={fullName(p.originalApprover)}
                    >
                      {fullName(p.originalApprover)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span
                      className="min-w-0 truncate font-medium text-brand-700"
                      title={fullName(p.proxyApprover)}
                    >
                      {fullName(p.proxyApprover)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3 text-slate-400" />
                      {LEVEL_ROLE_LABEL[p.approverLevel] || `ระดับ ${p.approverLevel}`}
                    </span>
                    <span>
                      {p.isDaily
                        ? `วันนี้ (${formatDate(p.dailyDate)})`
                        : `${formatDate(p.startDate)} – ${formatDate(p.endDate)}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ---------- แนวโน้ม + สถานะ ---------- */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="แนวโน้มคำขอลา 6 เดือนล่าสุด"
            subtitle="จำนวนคำขอที่ยื่นเข้าระบบในแต่ละเดือน"
          >
            {totalRequests === 0 ? (
              <EmptyState text="ยังไม่มีคำขอลาในระบบ" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTrend}
                    margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        fontFamily: "Kanit, sans-serif",
                        fontSize: 13,
                      }}
                    />
                    <Bar
                      dataKey="จำนวนคำขอ"
                      fill={CHART_PRIMARY}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel
            title="สถานะคำขอลา"
            subtitle={`จากทั้งหมด ${totalRequests} รายการ`}
          >
            <ul className="space-y-4">
              {STATUS_ORDER.map((key) => {
                const { label, color, Icon } = STATUS_META[key];
                const count = statusCounts[key];
                const pct = totalRequests
                  ? Math.round((count / totalRequests) * 100)
                  : 0;
                return (
                  <li key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <Icon className="h-4 w-4" style={{ color }} />
                        {label}
                      </span>
                      <span className="tabular-nums text-slate-900">
                        <span className="font-semibold">{count}</span>
                        <span className="ml-1 text-xs text-slate-500">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        {/* ---------- คำขอล่าสุด + ประเภทการลา ---------- */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="คำขอลาล่าสุด"
            subtitle="5 รายการที่ยื่นเข้าระบบล่าสุด"
            action={
              <PanelLink
                to="/admin/management"
                state={{ activeTab: "leaveRequests" }}
                label="ดูคำขอทั้งหมด"
              />
            }
          >
            {recentRequests.length === 0 ? (
              <EmptyState text="ยังไม่มีคำขอลา" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <th className="w-[16%] py-2 pr-2 font-semibold">วันที่</th>
                      <th className="w-[28%] py-2 pr-2 font-semibold">ผู้ขอ</th>
                      <th className="w-[24%] py-2 pr-2 font-semibold">ประเภท</th>
                      <th className="w-[14%] py-2 pr-2 font-semibold">จำนวน</th>
                      <th className="w-[18%] py-2 font-semibold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="truncate py-3 pr-2 text-slate-600">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="truncate py-3 pr-2 font-medium text-slate-800">
                          {fullName(r.user)}
                        </td>
                        <td className="truncate py-3 pr-2 text-slate-600">
                          {r.leaveType?.name || "-"}
                        </td>
                        <td className="truncate py-3 pr-2 text-slate-600">
                          {r.thisTimeDays ?? r.totalDays ?? "-"} วัน
                        </td>
                        <td className="py-3">
                          <StatusPill status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            title="ประเภทการลาที่ใช้มากที่สุด"
            subtitle="นับจากคำขอทั้งหมดในระบบ"
            action={
              <PanelLink to="/admin/leave-report" label="ดูรายงานสรุป" />
            }
          >
            {topLeaveTypes.length === 0 ? (
              <EmptyState text="ยังไม่มีข้อมูล" />
            ) : (
              <ul className="space-y-3.5">
                {topLeaveTypes.map((t) => (
                  <li key={t.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2 text-slate-700" title={t.name}>
                        {t.name}
                      </span>
                      <span className="tabular-nums font-semibold text-slate-900">
                        {t.count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((t.count / maxTypeCount) * 100)}%`,
                          backgroundColor: CHART_ACCENT,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ---------- อันดับผู้ลาเยอะสุด (ทั้งระบบ) ---------- */}
        <Panel
          title="อันดับผู้ลาเยอะสุด"
          subtitle="รวมจำนวนวันและครั้งที่ลาทั้งระบบ (อนุมัติ/รออนุมัติ) — กดเพื่อดูข้อมูลผู้ใช้"
        >
          {topLeavers.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูลการลา" />
          ) : (
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {topLeavers.map((t, i) => (
                <li key={t.user.id}>
                  <button
                    onClick={() => navigate(`/admin/user-info/${t.user.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-slate-200 text-slate-600"
                            : i === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {fullName(t.user)}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {t.user.department?.name || "-"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-brand-700">
                        {t.days} วัน
                      </p>
                      <p className="text-[11px] tabular-nums text-slate-400">
                        {t.count} ครั้ง
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ---------- Audit log + วันหยุด ---------- */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="ความเคลื่อนไหวล่าสุดในระบบ"
            subtitle="บันทึกการทำงาน (Audit Log) ล่าสุด"
            action={<PanelLink to="/admin/audit-logs" label="ดูบันทึกทั้งหมด" />}
          >
            {auditLogs.length === 0 ? (
              <EmptyState text="ยังไม่มีบันทึกการทำงาน" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {auditLogs.slice(0, 6).map((log) => (
                  <li key={log.id} className="flex items-start gap-3 py-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <History className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">
                        <span className="font-medium">
                          {fullName(log.user) || "ระบบ"}
                        </span>{" "}
                        <span className="text-slate-600">
                          {AUDIT_ACTION_TH[log.action] || log.action}
                        </span>{" "}
                        <span className="text-slate-500">{log.entityType}</span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="วันหยุดที่จะถึง"
            subtitle="ตามปฏิทินวันหยุดของระบบ"
            action={
              <PanelLink
                to="/admin/management"
                state={{ activeTab: "holidays" }}
                label="จัดการวันหยุด"
              />
            }
          >
            {upcomingHolidays.length === 0 ? (
              <EmptyState text="ไม่มีวันหยุดที่จะถึง" />
            ) : (
              <ul className="space-y-3">
                {upcomingHolidays.map((h) => (
                  <li key={h.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {h.description || "วันหยุด"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(h.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ส่วนประกอบย่อย ---------------- */

function StatTile({ icon, label, value, hint, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        accent ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-sm text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </button>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function PanelLink({ to, state, label }) {
  return (
    <Link
      to={to}
      state={state}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status];
  if (!meta) {
    return <span className="text-xs text-slate-500">{status}</span>;
  }
  const { label, color, Icon } = meta;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}12` }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400">{text}</div>
  );
}
