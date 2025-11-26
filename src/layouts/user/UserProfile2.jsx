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
                  className="max-w-full h-40 border rounded mb-4"
                />
                <label className="cursor-pointer px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded mb-2 transition">
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
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                >
                  ลบลายเซ็น
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-slate-600">ยังไม่มีลายเซ็น</p>
                <label className="cursor-pointer px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition">
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
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] px-4 py-10 font-kanit text-slate-100 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
            <FaUserAlt className="text-sky-300 text-2xl" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-100">
              User Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            โปรไฟล์ผู้ใช้
          </h1>
          <p className="text-slate-300 text-sm">
            ข้อมูลบัญชีและสถานะการทำงานของคุณในระบบ
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/70 border border-sky-500/20 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl p-6 sm:p-8 space-y-8">
          <div className="flex justify-center">
            {user?.profilePicturePath ? (
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-sky-500/30 blur-xl opacity-60" />
                <img
                  src={user.profilePicturePath}
                  alt="Profile"
                  className="relative h-40 w-40 rounded-full border-4 border-sky-400/60 object-cover shadow-[0_18px_40px_rgba(15,23,42,0.9)]"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-slate-500/40 blur-xl opacity-40" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-slate-500/60 bg-slate-800/80 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
                  <FaUserAlt className="h-16 w-16 text-slate-300" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user?.prefixName ?? ""}${user?.firstName ?? ""} ${
                  user?.lastName ?? ""
                }`.trim() || "-",
              ],
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
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                  {label}
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 shadow-inner shadow-slate-900/60">
                  {value || "-"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-end gap-3">
            <Link
              to="#"
              onClick={handleSignatureClick}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-emerald-400/60 transition-all duration-150"
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
