// src/layouts/user/UserProfile2.jsx
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import React, { useEffect } from "react";

function UserProfile2() {
  const { user } = useAuth();

  useEffect(() => {
    console.log("UserProfile2 – user context updated:", user);
  }, [user]);

  /* ---- helper: ตำแหน่งเป็น string หรือ object ---- */
  const positionName =
    typeof user?.position === "object"
      ? user.position?.name ?? "-"
      : user?.position ?? "-";

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-10">
          <FaUserAlt className="text-gray-800 text-4xl mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
            โปรไฟล์ผู้ใช้
          </h1>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8">
          {/* avatar */}
          <div className="flex justify-center mb-8">
            {user?.profilePicturePath ? (
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

          {/* details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user.prefixName}${user.firstName} ${user.lastName}`,
              ],
              ["อีเมล", user.email],
              ["เพศ", user.sex],
              ["เบอร์มือถือ", user.phone],
              ["ตำแหน่ง", positionName], // ← ADD
              ["คณะ", user.organization?.name],
              ["สาขา", user.department?.name],
              ["ประเภทบุคลากร", user.personnelType?.name],
              [
                "สายงาน",
                user.employmentType === "SUPPORT"
                  ? "สายสนับสนุน"
                  : user.employmentType === "ACADEMIC"
                  ? "สายวิชาการ"
                  : "ไม่มีข้อมูล",
              ],
              [
                "วันที่เริ่มงาน",
                user.hireDate
                  ? new Date(user.hireDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-",
              ],
              ["สถานะการใช้งาน", user.inActive ? "อยู่" : "ไม่อยู่"],
            ].map(([label, value], idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                  {value || "-"}
                </p>
              </div>
            ))}
          </div>

          {/* action */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
            <Link
              to="/change-password"
              className="inline-block px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition font-medium"
            >
              เปลี่ยนรหัสผ่าน
            </Link>
            <Link
              to="/profile/edit"
              className="inline-block px-6 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white transition font-medium"
            >
              แก้ไขโปรไฟล์
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile2;
