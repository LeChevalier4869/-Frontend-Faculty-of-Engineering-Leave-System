import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import getApiUrl from "../../utils/apiUtils";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import dayjs from "dayjs";

export default function Approver1DashBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);

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
    const fetchApproverRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(getApiUrl("leave-requests/for-approver1"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(res.data || []);
      } catch (err) {
        console.error("Approver fetch error:", err.response || err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลคำขอลาได้",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApproverRequests();
  }, []);

  const stats = {
    approved: leaveRequests.filter((r) => r.status === "APPROVED").length,
    pending: leaveRequests.filter((r) => r.status === "PENDING").length,
    rejected: leaveRequests.filter((r) => r.status === "REJECTED").length,
  };

  const pieData = [
    { name: "อนุมัติแล้ว", value: stats.approved },
    { name: "รออนุมัติ", value: stats.pending },
    { name: "ปฏิเสธแล้ว", value: stats.rejected },
  ];

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");
  const formatDateTime = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-black">
        กำลังโหลดแดชบอร์ดผู้อนุมัติ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      <h1 className="text-3xl font-bold mb-6 text-black">
        แดชบอร์ดผู้อนุมัติ - สวัสดีคุณ {user?.firstName} {user?.lastName} 👋
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-black">{stats.approved}</p>
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
            <p className="text-2xl font-semibold text-black">{stats.rejected}</p>
            <p className="text-black">ปฏิเสธแล้ว</p>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">สัดส่วนสถานะคำขอลา</h2>
        <div className="flex justify-center items-center">
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

      {/* Leave Requests Table */}
      <div className="rounded-lg shadow border border-gray-300 overflow-hidden mb-8 bg-white">
        <table className="table-fixed w-full text-sm text-black">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">วันที่ยื่น</th>
              <th className="px-4 py-3 text-left">ชื่อผู้ยื่น</th>
              <th className="px-4 py-3 text-left">ประเภทการลา</th>
              <th className="px-4 py-3 text-left">วันเริ่มต้น</th>
              <th className="px-4 py-3 text-left">วันสิ้นสุด</th>
              <th className="px-4 py-3 text-left">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length > 0 ? (
              leaveRequests.map((leave, idx) => {
                const statusKey = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`$ {
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/approver/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-3">{formatDateTime(leave.createdAt)}</td>
                    <td className="px-4 py-3">{leave.user?.firstName} {leave.user?.lastName}</td>
                    <td className="px-4 py-3">{leave.leaveType?.name || "-"}</td>
                    <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[statusKey] || "bg-gray-200 text-gray-700"}`}>
                        {statusLabels[statusKey] || leave.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                  ไม่มีคำขออนุมัติ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
