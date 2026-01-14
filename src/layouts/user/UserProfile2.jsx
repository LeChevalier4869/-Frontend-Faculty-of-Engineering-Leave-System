import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa";
import { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

function UserProfile2() {
  const { user } = useAuth();
  const MySwal = withReactContent(Swal);

  const handleSignatureClick = async () => {
    try {
      const res = await axios.get(apiEndpoints.signatureGetByUserId(user.id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const signatureFile = res.data === null ? null : res.data.file;

      const handleUpload = async (file, isUpdate = false) => {
        const formData = new FormData();
        formData.append("images", file);

        try {
          await axios({
            method: isUpdate ? "put" : "post",
            url: isUpdate
              ? apiEndpoints.signatureUpdate(user.id)
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

      MySwal.fire({
        title: "ลายเซ็นของคุณ",
        html: (
          <div className="flex flex-col items-center font-kanit">
            {signatureFile ? (
              <>
                <img
                  src={signatureFile}
                  alt="ลายเซ็น"
                  className="max-w-full h-40 border border-slate-200 rounded mb-4"
                />
                <label className="cursor-pointer px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded transition">
                  เปลี่ยนลายเซ็น
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUpload(file, true);
                    }}
                  />
                </label>

                <button
                  onClick={handleDelete}
                  className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded transition"
                >
                  ลบลายเซ็น
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-slate-600">ยังไม่มีลายเซ็น</p>
                <label className="cursor-pointer px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded transition">
                  อัปโหลดลายเซ็น
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleUpload(file, false);
                    }}
                  />
                </label>
              </>
            )}
          </div>
        ),
        showConfirmButton: false,
        showCloseButton: true,
        width: 420,
        background: "#ffffff",
      });
    } catch (err) {
      console.error("Error loading signature:", err);
    }
  };

  useEffect(() => {
    console.log("UserProfile2 – user context updated:", user);
  }, [user]);

  const positionName =
    typeof user?.position === "object"
      ? user.position?.name ?? "-"
      : user?.position ?? "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 font-kanit text-slate-900 rounded-2xl">
      <div className="mx-auto max-w-6xl space-y-10">

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <FaUserAlt className="text-sky-600 text-xl" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-slate-700">
              User Profile
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            โปรไฟล์ผู้ใช้
          </h1>

          <p className="text-slate-600 text-sm">
            ข้อมูลบัญชีและสถานะการทำงานของคุณในระบบ
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-10">
          
          <div className="flex justify-center">
            {user?.profilePicturePath ? (
              <img
                src={user.profilePicturePath}
                alt="Profile"
                className="h-40 w-40 rounded-full object-cover border border-slate-200 shadow"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-slate-100 border border-slate-300 shadow">
                <FaUserAlt className="h-16 w-16 text-slate-500" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              ["ชื่อ-นามสกุล",
                `${user?.prefixName ?? ""}${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "-"],
              ["อีเมล", user?.email],
              ["เพศ", user?.sex],
              ["เบอร์มือถือ", user?.phone],
              ["ตำแหน่ง", positionName],
              ["คณะ", user?.department?.organization?.name],
              ["สาขา", user?.department?.name],
              ["ประเภทบุคลากร", user?.personnelType?.name],
              [
                "สายงาน",
                user?.employmentType === "SUPPORT"
                  ? "สายสนับสนุน"
                  : user?.employmentType === "ACADEMIC"
                  ? "สายวิชาการ"
                  : "ไม่มีข้อมูล",
              ],
              [
                "วันที่เริ่มงาน",
                user?.hireDate
                  ? new Date(user.hireDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-",
              ],
            ].map(([label, value], idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {label}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner">
                  {value || "-"}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Link
              to="#"
              onClick={handleSignatureClick}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 hover:-translate-y-0.5 transition-all"
            >
              ลายเซ็น
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserProfile2;
