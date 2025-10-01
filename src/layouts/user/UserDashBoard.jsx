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
        const token = localStorage.getItem("accessToken"); // ✅ เพิ่มตรงนี้

        const [summaryRes, leavesRes] = await Promise.all([
          axios.get(getApiUrl("leave-balances/leave-summary"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(getApiUrl("leave-requests/my-requests"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ทดสอบ response
        // console.log("User Dashboard Summary Response:", summaryRes.data);
        // console.log("User Dashboard Leaves Response:", leavesRes.data);
        const summary = summaryRes.data;
        const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : [];

        const approved = leaves.filter((r) => r.status === "APPROVED").length;
        const pending = leaves.filter((r) => r.status === "PENDING").length;
        const rejected = leaves.filter((r) => r.status === "REJECTED").length;
        // console.log("User Dashboard Summary:", summary);
        const remainingLeave = summary.remainingDays || 0;

        setStats({ approved, pending, rejected, remainingLeave });

        const sorted = leaves
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  // Pie Chart Data - สัดส่วนสถานะคำขอลา
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
      <h1 className="text-3xl font-bold mb-6 text-black">
        สวัสดีคุณ {user?.firstName || ""} {user?.lastName || ""} 👋
      </h1>

      {/* Leave Balance by Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {entitlements.map((item) => (
          <div
            key={item.leaveType.name}
            className="bg-white p-6 rounded-lg shadow flex items-center"
          >
            <CalendarDays className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-black">
                {item.remainingDays}
              </p>
              <p className="text-black">วันลาคงเหลือ ({item.leaveType.name})</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <div className="flex justify-center items-center relative">
            <PieChart width={450} height={300}>
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
              <Legend layout="horizontal" align="center" verticalAlign="bottom" />
            </PieChart>
          </div>
        </div>

        {/* Bar Chart - จำนวนคำขอลาแยกตามประเภท */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            จำนวนคำขอลาตามประเภท
          </h2>
          <div className="flex justify-center items-center">
            <BarChart width={450} height={300} data={barData}>
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

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          <PlusCircle className="mr-2" />
          ยื่นลา
        </button>

        <button
          onClick={() => navigate("/leave")}
          className="flex items-center bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-gray-800"
        >
          <List className="mr-2" />
          ประวัติการลา
        </button>
      </div>

      {/* Legend for Status */}
      <div className="flex flex-wrap gap-4 items-center text-sm mb-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${statusColors[key]?.split(" ")[0] || "bg-gray-300"
                }`}
            />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Leave Request Table */}
      <div className="rounded-lg shadow border border-gray-300 overflow-hidden mb-8 bg-white">
        <table className="table-fixed w-full text-sm text-black">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">วันที่ยื่น</th>
              <th className="px-4 py-3 text-left">ประเภทการลา</th>
              <th className="px-4 py-3 text-left">วันเริ่มต้น</th>
              <th className="px-4 py-3 text-left">วันสิ้นสุด</th>
              <th className="px-4 py-3 text-left">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {recent.length > 0 ? (
              recent.map((leave, idx) => {
                const statusKey = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-3">
                      {formatDateTime(leave.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {leave.leaveType?.name || "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[statusKey] || "bg-gray-200 text-gray-700"
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
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchLeaveRequests();
        }}
      />
    </div>
  );
}
