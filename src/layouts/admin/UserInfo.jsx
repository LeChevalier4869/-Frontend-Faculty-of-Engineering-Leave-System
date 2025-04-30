import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { FaUserAlt } from "react-icons/fa";

export default function UserInfo() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(() => {
        window.location.href = "/login";
      });
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
      Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
            โปรไฟล์ผู้ใช้งาน
          </h1>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8">
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
              ["ชื่อ-นามสกุล", `${user.prefixName}${user.firstName} ${user.lastName}`],
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:text-right">
            <Link
              to="/admin/manage-user"
              className="inline-block px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition font-medium"
            >
              ← กลับไปหน้าจัดการผู้ใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
