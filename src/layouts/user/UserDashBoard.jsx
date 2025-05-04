import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Clock,
  PlusCircle,
  List,
  XCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import LeaveRequestModal from "./LeaveRequestModal";
import dayjs from "dayjs";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pending: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [recent, setRecent] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const statusLabels = {
    APPROVED: "อนุมัติแล้ว",
    PENDING: "รออนุมัติ",
    REJECTED: "ปฏิเสธแล้ว",
  };

  const statusColors = {
    APPROVED: "bg-green-500 text-white",
    PENDING: "bg-yellow-400 text-black",
    REJECTED: "bg-red-500 text-white",
  };

  useEffect(() => {
    const fetchUserStats = async () => {
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
        const pending = leaves.filter((r) => r.status === "PENDING").length;
        const rejected = leaves.filter((r) => r.status === "REJECTED").length;
        console.log("User Dashboard Summary:", summary);
        const remainingLeave = summary.remainingDays || 0;

        setStats({ totalUsers, totalRequests, pending, approved, rejected, cancelled });

        // most recent 5
        const sorted = leaves.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecent(sorted.slice(0, 5));
      } catch (err) {
        console.error("UserDashboard fetch error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        const res = await axios.get(apiEndpoints.getLeaveBalanceForMe, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(res.data.data)) {
          setEntitlements(res.data.data);
        } else {
          console.warn("Leave balance response is not an array:", res.data);
          setEntitlements([]);
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
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
      const token = localStorage.getItem("token");
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
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const pieData = [
    { name: "อนุมัติแล้ว", value: stats.approved },
    { name: "รออนุมัติ", value: stats.pending },
    { name: "ปฏิเสธแล้ว", value: stats.rejected },
  ];

  // Bar Chart Data - จำนวนคำขอลาแยกตามประเภท
  const leaveTypeStats = leaveRequest.reduce((acc, leave) => {
    const type = leave.leaveType?.name || "อื่นๆ";
    acc[type] = acc[type] ? acc[type] + 1 : 1;
    return acc;
  }, {});

  const barData = Object.keys(leaveTypeStats).map((type) => ({
    name: type,
    value: leaveTypeStats[type],
  }));

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm"); // สำหรับ createdAt
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY"); // สำหรับ startDate และ endDate

  if (loading || isLoading) {
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
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">
              {stats.approved}
            </p>
            <p className="text-black">อนุมัติแล้ว</p>
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
          <XCircle className="w-8 h-8 text-red-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">
              {stats.rejected}
            </p>
            <p className="text-black">ปฏิเสธแล้ว</p>
          </div>
        </div>
      </div>

      {/* Pie Chart and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            สัดส่วนสถานะคำขอลา
          </h2>
          <div className="flex justify-center items-center">
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* Bar Chart - จำนวนคำขอลาแยกตามประเภท */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            จำนวนคำขอลาตามประเภท
          </h2>
          <div className="flex justify-center items-center">
            <BarChart width={400} height={300} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
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
