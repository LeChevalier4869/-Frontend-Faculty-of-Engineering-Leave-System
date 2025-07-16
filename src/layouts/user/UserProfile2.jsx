import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function UserProfile2() {
  const { user } = useAuth();
  console.log("UserProfile2 – user context:", user);

  const MySwal = withReactContent(Swal);

  const handleSignatureClick = () => {
    MySwal.fire({
      title: "ลายเซ็นของคุณ",
      html: (
        <div className="flex flex-col items-center">
          {user.signature?.file ? (
            <img
              src={user.signature.file}
              alt="ลายเซ็น"
              className="max-w-full h-40 border rounded mb-4"
            />
          ) : (
            <p className="mb-4 text-gray-600">ยังไม่มีลายเซ็น</p>
          )}

          <label className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
            เลือกไฟล์ลายเซ็น
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // 🔧 อัปโหลดลายเซ็น: ใช้ fetch หรือ axios ตรงนี้
                  console.log("อัปโหลดลายเซ็น:", file);
                  Swal.fire("สำเร็จ", "กำลังอัปโหลดลายเซ็น...", "success");
                }
              }}
            />
          </label>
        </div>
      ),
      showConfirmButton: false,
      showCloseButton: true,
      width: 400,
    });
  };

  useEffect(() => {
    console.log("UserProfile2 – user context updated:", user);
  }, [user]);

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
              to="#"
              onClick={handleSignatureClick}
              className="inline-block rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition hover:bg-green-600"
            >
              ลายเซ็น
            </Link>

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
