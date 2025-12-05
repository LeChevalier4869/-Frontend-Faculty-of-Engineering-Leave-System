import React, { useEffect, useState } from "react";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import { Clock } from "lucide-react";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ eyebrow, title, description, right }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <div>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] text-sky-700 uppercase tracking-[0.2em]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="mt-2 text-lg md:text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
);

function LeaveAdmin() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 8;
  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  const statusColors = {
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const handleApprove = async (id) => {
    const { value } = await Swal.fire({
      title: "อนุมัติคำขอ",
      html:
        `<label class="swal2-label">เหตุผล:</label>` +
        `<textarea id="remarks" class="swal2-textarea"></textarea>` +
        `<label class="swal2-label">ความคิดเห็น:</label>` +
        `<textarea id="comment" class="swal2-textarea"></textarea>`,
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const remarks = document.getElementById("remarks").value.trim();
        const comment = document.getElementById("comment").value.trim();
        if (!remarks || !comment) {
          Swal.showValidationMessage("กรุณากรอกเหตุผลและความคิดเห็นให้ครบถ้วน");
          return;
        }
        return { remarks, comment };
      },
    });

    if (value) {
      try {
        await axios.post(apiEndpoints.ApproveleaveRequests(id), value);
        Swal.fire("สำเร็จ", "อนุมัติคำขอเรียบร้อยแล้ว", "success");
        fetchLeaveRequests();
      } catch (error) {
        Swal.fire("ผิดพลาด", error.response?.data?.message || "เกิดข้อผิดพลาด", "error");
      }
    }
  };

  const handleReject = async (id) => {
    const { value } = await Swal.fire({
      title: "ปฏิเสธคำขอ",
      html: `<label class="swal2-label">เหตุผล:</label><textarea id="remarks" class="swal2-textarea"></textarea>`,
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const remarks = document.getElementById("remarks").value.trim();
        if (!remarks) {
          Swal.showValidationMessage("กรุณากรอกเหตุผล");
          return;
        }
        return { remarks };
      },
    });

    if (value) {
      try {
        await axios.post(apiEndpoints.RejectleaveRequests(id), value);
        Swal.fire("สำเร็จ", "ปฏิเสธคำขอเรียบร้อยแล้ว", "success");
        fetchLeaveRequests();
      } catch (error) {
        Swal.fire("ผิดพลาด", error.response?.data?.message || "เกิดข้อผิดพลาด", "error");
      }
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(getApiUrl("leave-requests"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const formatDate = (v) =>
    new Date(v).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentItems = leaveRequests.slice(first, last);
  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 text-slate-800 font-kanit">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="text-slate-800 font-medium">กำลังโหลดข้อมูลคำขอลา...</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-sky-500" />
              กำลังดึงข้อมูลจากระบบ
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-kanit px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <Panel className="p-6">
          <SectionHeader
            eyebrow="Admin View"
            title="คำขอลาทั้งหมดในระบบ"
            description="ตรวจสอบคำขอลาทั้งหมด และดำเนินการอนุมัติหรือปฏิเสธ"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ชื่อผู้ลา
                  </th>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันที่เริ่ม
                  </th>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันที่สิ้นสุด
                  </th>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold text-center">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 border-b text-[11px] uppercase tracking-[0.16em] font-semibold text-center">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/leave/${item.id}`)}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"} hover:bg-sky-50 cursor-pointer transition-colors border-b border-slate-100`}
                    >
                      <td className="px-4 py-3">
                        {item.user?.prefixName} {item.user?.firstName} {item.user?.lastName}
                      </td>
                      <td className="px-4 py-3">{leaveTypes[item.leaveTypeId] || "ไม่ระบุ"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.startDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.endDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[item.status] ||
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td
                        className="px-6 py-3 text-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="bg-rose-500 hover:bg-rose-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500 text-sm">
                      ไม่มีข้อมูลคำขอ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-slate-700">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveAdmin;
