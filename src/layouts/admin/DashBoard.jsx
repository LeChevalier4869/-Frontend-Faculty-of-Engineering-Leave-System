import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  List,
} from "lucide-react";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [recent, setRecent] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, leavesRes, summaryRes] = await Promise.all([
          axios.get(getApiUrl("admin/users"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(getApiUrl("admin/leave-requests"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(getApiUrl("admin/report/leave-summary"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const users = usersRes.data.data || [];
        const leaves = leavesRes.data.data || [];
        const s = summaryRes.data.data || [];

        setStats({
          totalUsers: users.length,
          totalRequests: leaves.length,
          pending: leaves.filter((r) => r.status === "PENDING").length,
          approved: leaves.filter((r) => r.status === "APPROVED").length,
          rejected: leaves.filter((r) => r.status === "REJECTED").length,
          cancelled: leaves.filter((r) => r.status === "CANCELLED").length,
        });

        setRecent(
          leaves
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
        setSummary(s);
      } catch (err) {
        console.error("AdminDashboard fetch error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const statusPill = (status) => {
    const base =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "PENDING":
        return (
          <span
            className={`${base} bg-amber-50 text-amber-700 border border-amber-200`}
          >
            รออนุมัติ
          </span>
        );
      case "APPROVED":
        return (
          <span
            className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}
          >
            อนุมัติแล้ว
          </span>
        );
      case "REJECTED":
        return (
          <span
            className={`${base} bg-rose-50 text-rose-700 border border-rose-200`}
          >
            ถูกปฏิเสธ
          </span>
        );
      case "CANCELLED":
        return (
          <span
            className={`${base} bg-slate-50 text-slate-700 border border-slate-200`}
          >
            ยกเลิก
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-slate-50 text-slate-700 border border-slate-200`}
          >
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white font-kanit text-slate-700">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="font-medium">
              กำลังโหลดแดชบอร์ดผู้ดูแลระบบ...
            </span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลภาพรวม
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-700">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            แดชบอร์ด{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              ผู้ดูแลระบบ
            </span>
          </h1>
          <p className="text-slate-600 text-sm">
            ภาพรวมการใช้งานระบบ การยื่นลา และสถานะคำขอทั้งหมดในองค์กร
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-2">
          <Card
            icon={<Users className="w-6 h-6" />}
            label="ผู้ใช้งานทั้งหมด"
            value={stats.totalUsers}
            tone="indigo"
          />
          <Card
            icon={<List className="w-6 h-6" />}
            label="คำขอลาทั้งหมด"
            value={stats.totalRequests}
            tone="violet"
          />
          <Card
            icon={<Clock className="w-6 h-6" />}
            label="รออนุมัติ"
            value={stats.pending}
            tone="amber"
          />
          <Card
            icon={<CheckCircle className="w-6 h-6" />}
            label="อนุมัติแล้ว"
            value={stats.approved}
            tone="emerald"
          />
          <Card
            icon={<XCircle className="w-6 h-6" />}
            label="ถูกปฏิเสธ"
            value={stats.rejected}
            tone="rose"
          />
          <Card
            icon={<Calendar className="w-6 h-6" />}
            label="ยกเลิก"
            value={stats.cancelled}
            tone="slate"
          />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Section title="คำขอลาล่าสุด">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-slate-200">
                    <Th>วันที่</Th>
                    <Th>ผู้ขอ</Th>
                    <Th>ประเภทลา</Th>
                    <Th>สถานะ</Th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <Td>{formatDate(r.createdAt)}</Td>
                      <Td>
                        {r.user?.firstName} {r.user?.lastName}
                      </Td>
                      <Td>{r.leaveType?.name}</Td>
                      <Td>{statusPill(r.status)}</Td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-slate-500"
                      >
                        ไม่มีคำขอลา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="สรุปวันลาของผู้ใช้งาน (อนุมัติแล้ว)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-slate-200">
                    <Th>ชื่อผู้ใช้</Th>
                    <Th>จำนวนวันลา</Th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => (
                    <tr
                      key={s.userId}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <Td>{s.name}</Td>
                      <Td>{s.totalDays}</Td>
                    </tr>
                  ))}
                  {summary.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-6 text-center text-slate-500"
                      >
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, label, value, tone = "indigo" }) {
  const tones =
    {
      indigo: "from-indigo-100 to-indigo-50 border-indigo-200",
      violet: "from-violet-100 to-violet-50 border-violet-200",
      amber: "from-amber-100 to-amber-50 border-amber-200",
      emerald: "from-emerald-100 to-emerald-50 border-emerald-200",
      rose: "from-rose-100 to-rose-50 border-rose-200",
      slate: "from-slate-100 to-slate-50 border-slate-200",
    }[tone] ||
    "from-sky-100 to-sky-50 border-sky-200";

  return (
    <div className="relative rounded-2xl p-5 bg-white border shadow-sm overflow-hidden">
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tones} opacity-70 pointer-events-none`}
      />
      <div className="relative flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-semibold leading-tight text-slate-900 tracking-tight">
            {value}
          </p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-900">
      <header className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </header>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

const Th = ({ children }) => (
  <th className="py-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="py-3 px-3 text-sm text-slate-800 whitespace-nowrap">
    {children}
  </td>
);
