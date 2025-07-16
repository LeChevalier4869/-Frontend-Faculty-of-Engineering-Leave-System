import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import React, { useEffect } from "react";

function UserProfile2() {
  const { user } = useAuth();
  // console.log("UserProfile2 – user context:", user);

  /* ---- helper: แปลงค่าที่อาจเป็น object → string ---- */
  const positionName =
    typeof user?.position === "object"
      ? user.position?.name ?? "-"
      : user?.position ?? "-";

  /* ---- ชื่อคณะ: มีได้สองแหล่ง ---- */
  const orgName =
    user.organization?.name || user.department?.organization?.name || "-";

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-center">
          <FaUserAlt className="mr-3 text-4xl text-gray-800" />
          <h1 className="text-center text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl">
            โปรไฟล์ผู้ใช้
          </h1>
        </div>

        <div className="rounded-2xl bg-gray-50 p-6 shadow sm:p-8">
          {/* avatar */}
          <div className="mb-8 flex justify-center">
            {user?.profilePicturePath ? (
              <img
                src={user.profilePicturePath}
                alt="Profile"
                className="h-40 w-40 rounded-full border-4 border-gray-300 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-gray-300 bg-gray-200 shadow-lg">
                <FaUserAlt className="h-16 w-16 text-gray-600" />
              </div>
            )}
          </div>

          {/* details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user.prefixName}${user.firstName} ${user.lastName}`,
              ],
              ["อีเมล", user.email],
              ["เพศ", user.sex],
              ["เบอร์มือถือ", user.phone],
              ["ตำแหน่ง", user.position], // ← ADD
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
            {/* {<Link
              to="/profile/edit"
              className="inline-block rounded-lg bg-blue-400 px-6 py-2 font-medium text-white transition hover:bg-blue-500"
            >
              แก้ไขโปรไฟล์
            </Link>} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile2;
