import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, CheckCircle, XCircle, List } from "lucide-react";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import bg from "../../assets/bg.jpg";

export default function AdminDashboard() {
  const navigate = useNavigate();
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
          axios.get(getApiUrl("admin/users"), { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(getApiUrl("admin/leave-requests"), { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(getApiUrl("admin/report/leave-summary"), { headers: { Authorization: `Bearer ${token}` } }),
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
    const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "PENDING":
        return <span className={`${base} bg-yellow-500/20 text-yellow-300 border border-yellow-500/40`}>รออนุมัติ</span>;
      case "APPROVED":
        return <span className={`${base} bg-green-500/20 text-green-300 border border-green-500/40`}>อนุมัติแล้ว</span>;
      case "REJECTED":
        return <span className={`${base} bg-red-500/20 text-red-300 border border-red-500/40`}>ถูกปฏิเสธ</span>;
      case "CANCELLED":
        return <span className={`${base} bg-gray-500/20 text-gray-300 border border-gray-500/40`}>ยกเลิก</span>;
      default:
        return <span className={`${base} bg-slate-500/20 text-slate-200 border border-slate-500/40`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen relative font-kanit">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 min-h-screen flex items-center justify-center text-white">
          กำลังโหลดแดชบอร์ด...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen relative overflow-x-hidden font-kanit">
      {/* 🔹 Background & Overlays (เหมือนหน้า Login) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      {/* 🔹 Content */}
      <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-10 drop-shadow">
          แดชบอร์ด <span className="text-red-500">ผู้ดูแลระบบ</span>
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
          <Card icon={<Users className="w-6 h-6" />} label="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} tone="indigo" />
          <Card icon={<List className="w-6 h-6" />} label="คำขอลาทั้งหมด" value={stats.totalRequests} tone="violet" />
          <Card icon={<Clock className="w-6 h-6" />} label="รออนุมัติ" value={stats.pending} tone="amber" />
          <Card icon={<CheckCircle className="w-6 h-6" />} label="อนุมัติแล้ว" value={stats.approved} tone="emerald" />
          <Card icon={<XCircle className="w-6 h-6" />} label="ถูกปฏิเสธ" value={stats.rejected} tone="rose" />
          <Card icon={<Calendar className="w-6 h-6" />} label="ยกเลิก" value={stats.cancelled} tone="slate" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <Section title="คำขอลาล่าสุด">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-slate-200">
                  <tr className="border-b border-white/10">
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
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      onClick={() => navigate(`/admin/leave/${r.id}`)}
                    >
                      <Td>{formatDate(r.createdAt)}</Td>
                      <Td>{r.user?.firstName} {r.user?.lastName}</Td>
                      <Td>{r.leaveType?.name}</Td>
                      <Td>{statusPill(r.status)}</Td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-300">ไม่มีคำขอลา</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Leave Summary */}
          <Section title="สรุปวันลาของผู้ใช้งาน (อนุมัติแล้ว)">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-slate-200">
                  <tr className="border-b border-white/10">
                    <Th>ชื่อผู้ใช้</Th>
                    <Th>จำนวนวันลา</Th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => (
                    <tr key={s.userId} className="border-b border-white/5">
                      <Td>{s.name}</Td>
                      <Td>{s.totalDays}</Td>
                    </tr>
                  ))}
                  {summary.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-6 text-center text-slate-300">ไม่มีข้อมูล</td>
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

/* ---------- UI Subcomponents (ธีมเข้าชุดหน้า Login) ---------- */

function Card({ icon, label, value, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-500/30 to-indigo-500/10 border-indigo-400/30",
    violet: "from-violet-500/30 to-violet-500/10 border-violet-400/30",
    amber: "from-amber-500/30 to-amber-500/10 border-amber-400/30",
    emerald: "from-emerald-500/30 to-emerald-500/10 border-emerald-400/30",
    rose: "from-rose-500/30 to-rose-500/10 border-rose-400/30",
    slate: "from-slate-500/30 to-slate-500/10 border-slate-400/30",
  }[tone];

  return (
    <div className={`relative rounded-2xl p-5 border ${tones} bg-gray-900/70 backdrop-blur-md text-white shadow-2xl`}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">{icon}</div>
        <div>
          <p className="text-3xl font-semibold leading-tight drop-shadow">{value}</p>
          <p className="text-sm text-slate-300">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur-md shadow-2xl text-white">
      <header className="px-6 pt-6">
        <h2 className="text-xl font-semibold drop-shadow">{title}</h2>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

const Th = ({ children }) => (
  <th className="py-3 px-3 text-sm font-medium uppercase tracking-wide">{children}</th>
);

const Td = ({ children }) => (
  <td className="py-3 px-3 text-slate-100">{children}</td>
);
