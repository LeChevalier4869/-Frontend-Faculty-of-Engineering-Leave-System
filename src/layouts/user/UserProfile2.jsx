import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

function UserProfile2() {
  const { user } = useAuth();
  console.log("UserProfile2 – user context:", user);

  const MySwal = withReactContent(Swal);

  const handleSignatureClick = async () => {
    try {
      const res = await axios.get(apiEndpoints.signatureGetByUserId(user.id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("Signature data:", res.data);
      const signatureFile = res.data === null ? null : res.data.file;
      console.log("Signature file:", signatureFile);

      // ✅ ฟังก์ชันช่วยสำหรับอัปโหลด/อัปเดต
      const handleUpload = async (file, isUpdate = false) => {
        const formData = new FormData();
        formData.append("images", file);

        try {
          console.log(
            "Uploading to:",
            isUpdate
              ? `${apiEndpoints.signatureUpdate(user.id)}`
              : apiEndpoints.signatureUpload
          );
          await axios({
            method: isUpdate ? "put" : "post", // ✅ เปลี่ยนตรงนี้
            url: isUpdate
              ? `${apiEndpoints.signatureUpdate(user.id)}`
              : apiEndpoints.signatureUpload(user.id),
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });

          Swal.fire("สำเร็จ", "บันทึกลายเซ็นเรียบร้อยแล้ว", "success");
          window.location.reload();
        } catch (err) {
          Swal.fire(
            "เกิดข้อผิดพลาด",
            err.response?.data?.error || err.message,
            "error"
          );
        }
      };

      // ✅ ฟังก์ชันช่วยสำหรับลบ
      const handleDelete = async () => {
        const confirm = await Swal.fire({
          title: "ยืนยันการลบ",
          text: "คุณต้องการลบลายเซ็นนี้หรือไม่?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ลบ",
          cancelButtonText: "ยกเลิก",
        });

        if (confirm.isConfirmed) {
          try {
            await axios.delete(apiEndpoints.signatureDelete(user.id), {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            });

            Swal.fire("ลบแล้ว", "ลายเซ็นถูกลบเรียบร้อยแล้ว", "success");
            window.location.reload();
          } catch (err) {
            Swal.fire(
              "เกิดข้อผิดพลาด",
              err.response?.data?.error || err.message,
              "error"
            );
          }
        }
      };

      // ✅ แสดง SweetAlert2
      MySwal.fire({
        title: "ลายเซ็นของคุณ",
        html: (
          <div className="flex flex-col items-center">
            {signatureFile ? (
              <>
                <img
                  src={signatureFile}
                  alt="ลายเซ็น"
                  className="max-w-full h-40 border rounded mb-4"
                />
                <label className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mb-2">
                  เปลี่ยนลายเซ็น
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUpload(file, true); // ใช้ signatureUpdate
                    }}
                  />
                </label>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  ลบลายเซ็น
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-600">ยังไม่มีลายเซ็น</p>
                <label className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                  อัปโหลดลายเซ็น
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUpload(file, false); // ใช้ signatureUpload
                    }}
                  />
                </label>
              </>
            )}
          </div>
        ),
        showConfirmButton: false,
        showCloseButton: true,
        width: 400,
      });
    } catch (err) {
      console.error("Error loading signature:", err);
      // Swal.fire("เกิดข้อผิดพลาด", "โหลดลายเซ็นไม่สำเร็จ", "error");
    }
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
    user.department?.organization?.name || "-";

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
              ["คณะ", user.depertment?.organization?.name],
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
              // ["สถานะการใช้งาน", user.inActive ? "อยู่" : "ไม่อยู่"],
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
