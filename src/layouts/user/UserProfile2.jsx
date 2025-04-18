import { Link } from "react-router-dom";
import React from "react";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";

function UserProfile2() {
  const { user } = useAuth();

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["ชื่อ-นามสกุล", `${user.prefixName}${user.firstName} ${user.lastName}`],
              ["อีเมล", user.email],
              ["เพศ", user.sex],
              ["เบอร์มือถือ", user.phone],
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
                "ปีที่เริ่มงาน",
                new Date(user.hireDate).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              ],
              ["สถานะการใช้งาน", user.inActive ? "อยู่" : "ไม่อยู่"],
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
