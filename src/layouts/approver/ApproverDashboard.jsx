/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
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
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { API } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ApproverUserDetailModal from "../../components/approver/ApproverUserDetailModal";

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

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : "-";

const fullName = (u) =>
  u
    ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim()
    : "-";

export default function ApproverDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loadAll = useCallback(async () => {
    setError("");
    // ยิงแยกกันและกันพังทีละตัว — ถ้า endpoint ใดล้ม ส่วนที่เหลือยังแสดงได้
    // รายชื่อผู้ใช้ดึงจาก endpoint ที่ scope ตามบทบาท (หัวหน้าสาขา=เฉพาะสาขา, ระดับคณะ=ทั้งคณะ)
    const [reqRes, userRes] = await Promise.all([
      API.get("/approver/oversight/leave-requests").catch(() => null),
      API.get("/approver/oversight/users").catch(() => null),
    ]);

    if (!reqRes && !userRes) {
      setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองใหม่อีกครั้ง");
    }

    const oversightUsers = userRes?.data?.data || [];
    setRequests(reqRes?.data?.data || []);
    setUsers(oversightUsers);
    setUserCount(oversightUsers.length);
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

  const maxTypeCount = topLeaveTypes[0]?.count || 1;
  const totalRequests = requests.length;

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.fullName || "").toLowerCase();
      return (
        name.includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.position || "").toLowerCase().includes(q) ||
        (u.department?.name || "").toLowerCase().includes(q)
      );
    });
  }, [users, userSearch]);

  // อันดับผู้ลาเยอะสุด — รวมจำนวนวันลา (เฉพาะที่อนุมัติ/รออนุมัติ) ต่อคน เอา 5 อันดับแรก
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
      .slice(0, 5);
  }, [requests]);

  // ปฏิทินการลาเดือนนี้ — นับจำนวนคนที่ลาในแต่ละวัน (เฉพาะอนุมัติ/รออนุมัติ)
  const leaveCalendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = new Date(year, month, 1).getDay();
    const counts = {};
    const dayOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    for (const r of requests) {
      if (r.status === "REJECTED" || r.status === "CANCELLED") continue;
      if (!r.startDate || !r.endDate) continue;
      const s = dayOnly(new Date(r.startDate));
      const e = dayOnly(new Date(r.endDate));
      for (let d = 1; d <= daysInMonth; d++) {
        const cur = new Date(year, month, d);
        if (cur >= s && cur <= e) counts[d] = (counts[d] || 0) + 1;
      }
    }
    return { year, month, daysInMonth, startWeekday, counts, today: now.getDate() };
  }, [requests]);

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
                Approver Dashboard
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="ผู้ใช้ในความดูแล"
            value={userCount}
          />
          <StatTile
            icon={<FileText className="h-5 w-5" />}
            label="คำขอลาทั้งหมด"
            value={totalRequests}
          />
          <StatTile
            icon={<Clock className="h-5 w-5" />}
            label="รออนุมัติ"
            value={statusCounts.PENDING}
            accent={statusCounts.PENDING > 0}
            hint={statusCounts.PENDING > 0 ? "มีรายการรอดำเนินการ" : "ไม่มีรายการค้าง"}
          />
          <StatTile
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="อนุมัติแล้ว"
            value={statusCounts.APPROVED}
          />
          <StatTile
            icon={<XCircle className="h-5 w-5" />}
            label="ถูกปฏิเสธ"
            value={statusCounts.REJECTED}
          />
        </div>

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
            subtitle="5 รายการล่าสุดในความดูแลของคุณ"
          >
            {recentRequests.length === 0 ? (
              <EmptyState text="ยังไม่มีคำขอลา" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <th className="w-[16%] py-2 pr-2 font-semibold">
                        วันที่
                      </th>
                      <th className="w-[28%] py-2 pr-2 font-semibold">ผู้ขอ</th>
                      <th className="w-[24%] py-2 pr-2 font-semibold">
                        ประเภท
                      </th>
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
            subtitle="นับจากคำขอในความดูแลของคุณ"
          >
            {topLeaveTypes.length === 0 ? (
              <EmptyState text="ยังไม่มีข้อมูล" />
            ) : (
              <ul className="space-y-3.5">
                {topLeaveTypes.map((t) => (
                  <li key={t.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className="truncate pr-2 text-slate-700"
                        title={t.name}
                      >
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

        {/* ---------- อันดับผู้ลา + ปฏิทินการลา ---------- */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            title="อันดับผู้ลาเยอะสุด"
            subtitle="รวมจำนวนวันลา (อนุมัติ/รออนุมัติ)"
          >
            {topLeavers.length === 0 ? (
              <EmptyState text="ยังไม่มีข้อมูลการลา" />
            ) : (
              <ul className="space-y-1.5">
                {topLeavers.map((t, i) => (
                  <li key={t.user.id}>
                    <button
                      onClick={() => setSelectedUserId(t.user.id)}
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
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-brand-700">
                        {t.days} วัน
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            className="xl:col-span-2"
            title="ปฏิทินการลาเดือนนี้"
            subtitle="จำนวนคนที่ลาในแต่ละวัน"
          >
            <MiniCalendar cal={leaveCalendar} />
          </Panel>
        </div>

        {/* ---------- รายชื่อผู้ใช้ในความดูแล ---------- */}
        <Panel
          title="รายชื่อผู้ใช้ในความดูแล"
          subtitle={`${users.length} คน — กดเพื่อดูโปรไฟล์ ยอดวันลาคงเหลือ และประวัติการลา`}
        >
          <div className="mb-3">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="ค้นหาชื่อ อีเมล ตำแหน่ง หรือสาขา..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          {filteredUsers.length === 0 ? (
            <EmptyState text="ไม่พบผู้ใช้งาน" />
          ) : (
            <ul className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredUsers.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => setSelectedUserId(u.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
                      {(u.firstName || "?").charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {u.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {u.position || "ไม่ระบุตำแหน่ง"} · {u.department?.name || "ไม่ระบุสาขา"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {selectedUserId != null && (
        <ApproverUserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

/* ---------------- ส่วนประกอบย่อย ---------------- */

function StatTile({ icon, label, value, hint, onClick, accent = false }) {
  const clickable = typeof onClick === "function";
  const Wrapper = clickable ? "button" : "div";
  return (
    <Wrapper
      {...(clickable ? { type: "button", onClick } : {})}
      className={`group w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
        clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
      } ${accent ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200"}`}
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
        {clickable && (
          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-sm text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Wrapper>
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

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function MiniCalendar({ cal }) {
  const { year, month, daysInMonth, startWeekday, counts, today } = cal;
  const monthLabel = new Date(year, month, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <p className="mb-2 text-center text-sm font-medium text-slate-700">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 text-[11px] font-medium ${i === 0 || i === 6 ? "text-rose-400" : "text-slate-400"}`}
          >
            {w}
          </div>
        ))}
        {cells.map((d, idx) => {
          if (d === null) return <div key={`b${idx}`} />;
          const c = counts[d] || 0;
          const isToday = d === today;
          return (
            <div
              key={d}
              title={c > 0 ? `${c} คนลาในวันนี้` : ""}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-sm ${
                c > 0
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-slate-600"
              } ${isToday ? "ring-2 ring-brand-400" : ""}`}
            >
              {d}
              {c > 0 && (
                <span className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-semibold text-white">
                  {c}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
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
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}12`,
      }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function EmptyState({ text }) {
  return <div className="py-10 text-center text-sm text-slate-400">{text}</div>;
}
