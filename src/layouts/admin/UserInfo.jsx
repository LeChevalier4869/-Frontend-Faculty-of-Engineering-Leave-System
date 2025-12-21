import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { FaUserAlt } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/th";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function UserInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => {
          window.location.href = "/login";
        }
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiEndpoints.userInfoById(id), authHeader());
      setUser(res.data.user);
    } catch (err) {
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const res = await axios.get(
        apiEndpoints.getLeaveByUserId(id),
        authHeader()
      );
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.leaveRequests || [];
      console.log("Leave Requests:", data);
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(
        apiEndpoints.availableLeaveType,
        authHeader()
      );
      const map = {};
      (res.data.data || []).forEach((lt) => {
        map[lt.id] = lt.name;
      });
      setLeaveTypesMap(map);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    loadUser();
    loadLeaveRequests();
    fetchLeaveTypes();
  }, [id]);

  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  const statusLabels = {
    APPROVED: "อนุมัติแล้ว",
    PENDING: "รออนุมัติ",
    REJECTED: "ปฏิเสธ",
    CANCELLED: "ยกเลิก",
  };
  const statusColors = {
    APPROVED:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING:
      "bg-amber-50 text-amber-700 border border-amber-200",
    REJECTED:
      "bg-rose-50 text-rose-700 border border-rose-200",
    CANCELLED:
      "bg-slate-100 text-slate-700 border border-slate-300",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center font-kanit text-slate-700 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
            </div>
            <span className="font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center font-kanit text-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-rose-200 shadow-sm p-6 text-center">
          <p className="text-rose-600 font-medium">ไม่พบข้อมูลผู้ใช้งาน</p>
          <Link
            to="/admin/manage-user"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700"
          >
            ← กลับไปหน้าจัดการผู้ใช้งาน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <FaUserAlt className="text-lg" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                โปรไฟล์ผู้ใช้งาน
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                ดูรายละเอียดบัญชีและประวัติการลาของผู้ใช้งาน
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Panel className="p-6 sm:p-8">
          <div className="flex justify-center mb-8">
            {user.profilePicturePath ? (
              <img
                src={user.profilePicturePath}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-slate-200 shadow-md"
              />
            ) : (
              <div className="w-40 h-40 rounded-full flex justify-center items-center bg-slate-100 border-4 border-slate-200 shadow-md">
                <FaUserAlt className="text-slate-500 w-16 h-16" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user.prefixName ?? ""}${user.firstName ?? ""} ${
                  user.lastName ?? ""
                }`,
              ],
              ["อีเมล", user.email],
              ["เพศ", user.sex || "-"],
              ["เบอร์มือถือ", user.phone || "-"],
              [
                "คณะ",
                user.organization?.name ||
                  user.department?.organization?.name ||
                  "-",
              ],
              ["สาขา", user.department?.name || "-"],
              ["ประเภทบุคลากร", user.personnelType?.name || "-"],
              [
                "สายงาน",
                user.employmentType === "SUPPORT"
                  ? "สายสนับสนุน"
                  : user.employmentType === "ACADEMIC"
                  ? "สายวิชาการ"
                  : "ไม่มีข้อมูล",
              ],
              [
                "ปีที่เริ่มงาน",
                user.hireDate
                  ? new Date(user.hireDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-",
              ],
            ].map(([label, value], idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  {label}
                </label>
                <p className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-900">
                  {value || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/admin/manage-user"
              className="inline-block px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition"
            >
              ← กลับไปหน้าจัดการผู้ใช้งาน
            </Link>
            <Link
              to={`/admin/user/${id}`}
              className="inline-block px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition"
            >
              แก้ไขข้อมูลผู้ใช้
            </Link>
          </div>
        </Panel>

        {/* Leave History */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-slate-900">
            ประวัติการลา
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันที่ยื่น
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันเริ่มต้น
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันสิ้นสุด
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave, idx) => {
                    const statusKey = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-sky-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {leaveTypesMap[leave.leaveTypeId] || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[statusKey] ||
                              "bg-slate-100 text-slate-700 border border-slate-300"
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
                    <td
                      colSpan="5"
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
