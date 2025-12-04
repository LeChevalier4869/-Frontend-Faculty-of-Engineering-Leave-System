import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import dayjs from "dayjs";

export default function AdminDashboard() {
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });

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
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }
        const [leavesRes] = await Promise.all([
          axios.get(getApiUrl("leave-requests/"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const leaves = Array.isArray(leavesRes.data.data)
          ? leavesRes.data.data
          : [];

        const approved = leaves.filter((r) => r.status === "APPROVED").length;
        const pending = leaves.filter((r) => r.status === "PENDING").length;
        const rejected = leaves.filter((r) => r.status === "REJECTED").length;

        setStats({ approved, pending, rejected });

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

    const fetchAllLeaveTypes = async () => {
      try {
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }
        const response = await axios.get(getApiUrl("leave-types/"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response.data)
          ? response.data
          : [];
        setLeaveType(data); // อัปเดต state
        console.log(leaveType)
      } catch (error) {
        console.error("fetchAllLeaveTypes error:", error.response || error);
        setLeaveType([]); // กรณี error
      }
    };

    fetchUserStats();
    fetchAllLeaveTypes();
  }, []);

  const pieData = [
    { name: "อนุมัติแล้ว", value: stats.approved },
    { name: "รออนุมัติ", value: stats.pending },
    { name: "ปฏิเสธแล้ว", value: stats.rejected },
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

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดแดชบอร์ด...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      <h1 className="text-3xl font-bold mb-6 text-black">
        สวัสดีผู้ดูแลระบบ คุณ{user?.firstName || ""} {user?.lastName || ""}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="ml-4">
            <p className="text-black">อนุมัติแล้ว</p>
            <p className="text-2xl font-semibold text-black">
              {stats.approved}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <Clock className="w-8 h-8 text-yellow-500" />
          <div className="ml-4">
            <p className="text-black">รออนุมัติ</p>
            <p className="text-2xl font-semibold text-black">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <XCircle className="w-8 h-8 text-red-500" />
          <div className="ml-4">
            <p className="text-black">ปฏิเสธแล้ว</p>
            <p className="text-2xl font-semibold text-black">
              {stats.rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Pie + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            สัดส่วนสถานะคำขอลาทั้งหมด
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

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            จำนวนคำขอลาทั้งหมดตามประเภท
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

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 items-center text-sm mb-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                statusColors[key]?.split(" ")[0] || "bg-gray-300"
              }`}
            />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Recent Leave Table */}
      <div className="rounded-lg shadow border border-gray-300 overflow-hidden mb-8 bg-white">
        <table className="table-fixed w-full text-sm text-black">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">วันที่ยื่น</th>
              <th className="px-4 py-3 text-left">ผู้ลา</th>
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
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-3">
                      {formatDateTime(leave.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {leave.user.prefixName}
                      {leave.user.firstName} {leave.user.lastName}
                    </td>
                    <td className="px-4 py-3">
                      {leave.leaveType?.name || "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[statusKey] || "bg-gray-200 text-gray-700"
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
    </div>
  );
}
