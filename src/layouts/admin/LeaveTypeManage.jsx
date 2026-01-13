import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import LeaveTypeService from "../../services/leaveTypeService";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function LeaveTypeManage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [name, setName] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400";
  const checkboxClass =
    "h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500";
  const buttonClass =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium text-white shadow-sm transition px-4 py-2";

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
      const res = await LeaveTypeService.getAllLeaveTypes({ limit: 100 });
      setLeaveTypes(res.leaveTypes || []);
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
    setName("");
    setIsAvailable(false);
    setEditId(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      return Swal.fire("Error", "กรุณาระบุชื่อประเภทการลา", "error");
    }
    try {
      await LeaveTypeService.createLeaveType({ name, isAvailable });
      Swal.fire("บันทึกสำเร็จ!", "", "success");
      resetForm();
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (id) => {
    const lt = leaveTypes.find((t) => t.id === id);
    if (!lt) return;
    setName(lt.name);
    setIsAvailable(lt.isAvailable);
    setEditId(lt.id);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      return Swal.fire("Error", "กรุณาระบุชื่อประเภทการลา", "error");
    }
    try {
      await LeaveTypeService.updateLeaveType(editId, { name, isAvailable });
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
      await LeaveTypeService.deleteLeaveType(id);
      Swal.fire("ลบสำเร็จ!", "", "success");
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-6">
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
                จัดการประเภทการลา
              </h1>
              <p className="text-sm text-slate-600">
                เพิ่ม แก้ไข หรือลบประเภทการลาที่ใช้ในระบบ
              </p>
            </div>
            <div className="text-xs text-slate-500">
              ทั้งหมด{" "}
              <span className="font-semibold text-sky-600">
                {leaveTypes.length}
              </span>{" "}
              ประเภท
            </div>
          </div>
        </div>

        <Panel className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                ชื่อประเภทการลา
              </label>
              <input
                type="text"
                placeholder="เช่น ลาป่วย, ลากิจ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-3 lg:col-span-1">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
                className={checkboxClass}
              />
              <span className="text-sm text-slate-800">
                สามารถลาในระบบได้
              </span>
            </div>
            <div className="lg:col-span-1 flex lg:justify-end">
              <button
                onClick={editId ? handleUpdate : handleAdd}
                className={`${buttonClass} ${
                  editId
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-sky-600 hover:bg-sky-500"
                } w-full lg:w-auto`}
              >
                {editId ? "อัปเดต" : "เพิ่ม"}
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm text-slate-900 border-collapse bg-white">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ชื่อประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ลาในระบบได้
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : leaveTypes.length > 0 ? (
                  leaveTypes.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50 transition-colors`}
                    >
                      <td className="px-4 py-2 text-slate-600">{t.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {t.name}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.isAvailable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {t.isAvailable ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(t.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-400"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ไม่มีข้อมูลประเภทการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
