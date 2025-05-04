import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { token } = useAuth(); // ✅ ดึง token จาก auth
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
    if (!token) return; // ✅ token ยังไม่พร้อม ไม่ fetch
  
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
        const summary = summaryRes.data.data || [];
  
        setStats({
          totalUsers: users.length,
          totalRequests: leaves.length,
          pending: leaves.filter((r) => r.status === "PENDING").length,
          approved: leaves.filter((r) => r.status === "APPROVED").length,
          rejected: leaves.filter((r) => r.status === "REJECTED").length,
          cancelled: leaves.filter((r) => r.status === "CANCELLED").length,
        });
  
        setRecent(leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        setSummary(summary);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-black">
        กำลังโหลดแดชบอร์ด...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      <h1 className="text-3xl font-bold mb-6 text-black">แดชบอร์ดผู้ดูแลระบบ</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card icon={<Users className="text-blue-500" />} label="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} />
        <Card icon={<List className="text-indigo-500" />} label="คำขอลาทั้งหมด" value={stats.totalRequests} />
        <Card icon={<Clock className="text-yellow-500" />} label="รออนุมัติ" value={stats.pending} />
        <Card icon={<CheckCircle className="text-green-500" />} label="อนุมัติแล้ว" value={stats.approved} />
        <Card icon={<XCircle className="text-red-500" />} label="ถูกปฏิเสธ" value={stats.rejected} />
        <Card icon={<Calendar className="text-gray-500" />} label="ยกเลิก" value={stats.cancelled} />
      </div>

      {/* Recent Requests */}
      <Section title="คำขอลาล่าสุด">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-medium text-black">วันที่</th>
              <th className="p-3 font-medium text-black">ผู้ขอ</th>
              <th className="p-3 font-medium text-black">ประเภทลา</th>
              <th className="p-3 font-medium text-black">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/leave/${r.id}`)}
              >
                <td className="p-3 text-black">{formatDate(r.createdAt)}</td>
                <td className="p-3 text-black">{r.user.firstName} {r.user.lastName}</td>
                <td className="p-3 text-black">{r.leaveType.name}</td>
                <td className="p-3 text-black">{r.status}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-black">ไม่มีคำขอลา</td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* Leave Summary */}
      <Section title="สรุปวันลาของผู้ใช้งาน (อนุมัติแล้ว)">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-medium text-black">ชื่อผู้ใช้</th>
              <th className="p-3 font-medium text-black">จำนวนวันลา</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.userId} className="border-t hover:bg-gray-50">
                <td className="p-3 text-black">{s.name}</td>
                <td className="p-3 text-black">{s.totalDays}</td>
              </tr>
            ))}
            {summary.length === 0 && (
              <tr>
                <td colSpan="2" className="p-4 text-center text-black">ไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

// ✅ Component ย่อยเพื่อความสะอาด
function Card({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
      <div className="w-8 h-8">{icon}</div>
      <div className="ml-4">
        <p className="text-2xl font-semibold text-black">{value}</p>
        <p className="text-black">{label}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h2 className="text-xl font-semibold mb-4 text-black">{title}</h2>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
