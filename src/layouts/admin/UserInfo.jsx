import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link,useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { FaUserAlt } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/th";

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
    APPROVED: "bg-green-500 text-white",
    PENDING: "bg-yellow-500 text-white",
    REJECTED: "bg-red-500 text-white",
    CANCELLED: "bg-gray-500 text-white",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-kanit">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-kanit">
        ไม่พบข้อมูลผู้ใช้งาน
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-10">
          <FaUserAlt className="text-gray-800 text-4xl mr-3" />
          <h1 className="text-4xl font-bold text-gray-800 text-center">
            โปรไฟล์ผู้ใช้งาน
          </h1>
        </div>

        {/* ข้อมูลผู้ใช้ */}
        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8 mb-10">
          <div className="flex justify-center mb-8">
            {user.profilePicturePath ? (
              <img
                src={user.profilePicturePath}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-300 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-full flex justify-center items-center bg-gray-200 border-4 border-gray-300 shadow-lg">
                <FaUserAlt className="text-gray-600 w-16 h-16" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user.prefixName}${user.firstName} ${user.lastName}`,
              ],
              ["อีเมล", user.email],
              ["เพศ", user.sex || "-"],
              ["เบอร์มือถือ", user.phone || "-"],
              ["คณะ", user.organization?.name || "-"],
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
              ["สถานะการใช้งาน", user.isActive ? "ใช้งานอยู่" : "ไม่ใช้งาน"],
            ].map(([label, value], idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/admin/manage-user"
              className="inline-block px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition font-medium"
            >
              ← กลับไปหน้าจัดการผู้ใช้งาน
            </Link>
            <Link
              to={`/admin/user/${id}`}
              className="inline-block px-6 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white transition font-medium"
            >
              แก้ไขข้อมูลผู้ใช้
            </Link>
          </div>
        </div>

        {/* ข้อมูลการลา */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            ประวัติการลา
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">วันที่ยื่น</th>
                  <th className="px-4 py-3">ประเภทการลา</th>
                  <th className="px-4 py-3">วันเริ่มต้น</th>
                  <th className="px-4 py-3">วันสิ้นสุด</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave) => {
                    const statusKey = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id}
                        className="border-t"
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3">
                          {formatDate(leave.createdAt)}
                        </td>
                        <td className="px-4 py-2">
                          {leaveTypesMap[leave.leaveTypeId] || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[statusKey] ||
                              "bg-gray-200 text-gray-700"
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
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
