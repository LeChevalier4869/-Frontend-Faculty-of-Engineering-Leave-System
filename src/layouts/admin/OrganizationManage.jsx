import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";
import { apiEndpoints } from "../../utils/api";

const PAGE_SIZE = 10;

export default function OrganizationManage() {
  const [organizations, setOrganizations] = useState([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
    } else {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/organizations`,
        authHeader()
      );
      setOrganizations(res.data.data || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setNewName("");
    setEditId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      return Swal.fire("Error", "ต้องระบุชื่อหน่วยงาน", "error");
    }
    try {
      await axios.post(
        apiEndpoints.organizationCreate,
        { name: newName },
        authHeader()
      );
      Swal.fire("บันทึกสำเร็จ!", "", "success");
      resetForm();
      loadData();
      setCurrentPage(1);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (id) => {
    const org = organizations.find((o) => o.id === id);
    if (!org) return;
    setNewName(org.name);
    setEditId(org.id);
  };

  const handleUpdate = async () => {
    if (!newName.trim()) {
      return Swal.fire("Error", "ต้องระบุชื่อหน่วยงาน", "error");
    }
    try {
      await axios.put(
        apiEndpoints.organizationUpdate(editId),
        { name: newName },
        authHeader()
      );
      Swal.fire("อัปเดตสำเร็จ!", "", "success");
      resetForm();
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${BASE_URL}/admin/organizations/${id}`,
        authHeader()
      );
      Swal.fire("ลบสำเร็จ!", "ข้อมูลหน่วยงานถูกลบแล้ว", "success");
      const pageCount = Math.ceil(organizations.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const totalPages = Math.ceil(organizations.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = organizations.slice(startIndex, startIndex + PAGE_SIZE);

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการองค์กร
              </h1>
              <p className="text-sm text-slate-600">
                ดูข้อมูลหน่วยงานสำหรับใช้กำหนดแผนกและสิทธิ์ต่าง ๆ (ปิดกั้นการแก้ไขชั่วคราว)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800 mb-1">ปิดกั้นการแก้ไขชั่วคราว</h3>
              <p className="text-xs text-amber-700">
                ฟีเจอร์นี้ถูกปิดกั้นการแก้ไขชั่วคราวเนื่องจากมีความเสี่ยงต่อความเสถียรของระบบ 
                การเปลี่ยนแปลงข้อมูลอาจทำให้ระบบทำงานผิดพลาดได้จาก hardcoded logic และ dependencies ที่ซับซ้อน
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 space-y-4 opacity-75">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-50">
            <input
              type="text"
              placeholder="กรอกชื่อองค์กร"
              value={newName}
              disabled
              className={`${inputBase} col-span-2 bg-slate-100 cursor-not-allowed`}
            />
            <button
              disabled
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition bg-slate-300 cursor-not-allowed opacity-50"
            >
              ปิดกั้นการแก้ไข
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[8%]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ชื่อองค์กร
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold w-[20%]">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : displayed.length > 0 ? (
                  displayed.map((o, idx) => (
                    <tr
                      key={o.id}
                      className={`border-t border-slate-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50`}
                    >
                      <td className="px-4 py-2">{startIndex + idx + 1}</td>
                      <td className="px-4 py-2">{o.name}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            disabled
                            className="inline-flex items-center justify-center rounded-lg bg-slate-300 px-3 py-1 text-xs font-medium text-slate-500 cursor-not-allowed opacity-50"
                          >
                            แก้ไข (ปิดกั้น)
                          </button>
                          <button
                            disabled
                            className="inline-flex items-center justify-center rounded-lg bg-slate-300 px-3 py-1 text-xs font-medium text-slate-500 cursor-not-allowed opacity-50"
                          >
                            ลบ (ปิดกั้น)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ยังไม่มีข้อมูลหน่วยงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-lg px-4 py-3 border border-slate-200">
            <div className="text-sm text-slate-700">
              แสดง {startIndex + 1} ถึง {Math.min(startIndex + PAGE_SIZE, organizations.length)} จาก {organizations.length} รายการ
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              {(() => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage <= 4) {
                    pages.push(2, 3, 4, 5, '...', totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }
                return pages.map((page, idx) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page ? 'z-10 bg-sky-50 border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
