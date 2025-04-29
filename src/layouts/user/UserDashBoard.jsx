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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (!token) throw new Error("No auth token");
        const [usersRes, leavesRes] = await Promise.all([
          axios.get(getApiUrl("admin/users"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(getApiUrl("admin/leave-requests"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const users = Array.isArray(usersRes.data.data) ? usersRes.data.data : [];
        const leaves = Array.isArray(leavesRes.data.data) ? leavesRes.data.data : [];

        // compute counts
        const totalUsers = users.length;
        const totalRequests = leaves.length;
        const pending = leaves.filter((r) => r.status === "PENDING").length;
        const approved = leaves.filter((r) => r.status === "APPROVED").length;
        const rejected = leaves.filter((r) => r.status === "REJECTED").length;
        const cancelled = leaves.filter((r) => r.status === "CANCELLED").length;

        setStats({ totalUsers, totalRequests, pending, approved, rejected, cancelled });

        // most recent 5
        const sorted = leaves.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecent(sorted.slice(0, 5));
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
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Users className="w-8 h-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.totalUsers}</p>
            <p className="text-black">ผู้ใช้งานทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <List className="w-8 h-8 text-indigo-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.totalRequests}</p>
            <p className="text-black">คำขอลาทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Clock className="w-8 h-8 text-yellow-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.pending}</p>
            <p className="text-black">รออนุมัติ</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.approved}</p>
            <p className="text-black">อนุมัติแล้ว</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <XCircle className="w-8 h-8 text-red-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.rejected}</p>
            <p className="text-black">ถูกปฏิเสธ</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Calendar className="w-8 h-8 text-gray-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.cancelled}</p>
            <p className="text-black">ยกเลิก</p>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-black">คำขอลาล่าสุด</h2>
        <div className="overflow-x-auto">
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
                  <td className="p-3 text-black">
                    {r.user.firstName} {r.user.lastName}
                  </td>
                  <td className="p-3 text-black">{r.leaveType.name}</td>
                  <td className="p-3 text-black">{r.status}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-black">
                    ไม่มีคำขอลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); 
}
