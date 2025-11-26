import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl overflow-hidden bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl ${className}`}
  >
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
    "border border-sky-500/30 rounded-xl px-3 py-2 bg-slate-900/70 text-sm text-slate-100 shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:outline-none focus:ring-2 focus:ring-sky-400/70 placeholder:text-slate-500";
  const checkboxClass =
    "h-4 w-4 rounded border-slate-500 text-sky-400 focus:ring-sky-500 bg-slate-900/80";
  const buttonClass =
    "text-white text-sm px-4 py-2 rounded-xl shadow-[0_12px_32px_rgba(8,47,73,0.85)] transition";

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
      const res = await axios.get(`${BASE_URL}/leave-types/`, authHeader());
      setLeaveTypes(res.data.data);
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
      await axios.post(
        `${BASE_URL}/leave-types/`,
        { name, isAvailable },
        authHeader()
      );
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
      await axios.put(
        `${BASE_URL}/leave-types/${editId}`,
        { name, isAvailable },
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
      await axios.delete(`${BASE_URL}/leave-types/${id}`, authHeader());
      Swal.fire("ลบสำเร็จ!", "", "success");
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] px-4 py-8 md:px-8 font-kanit text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.35)] w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-100">
              Leave Types
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
                จัดการประเภทการลา
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                เพิ่ม แก้ไข หรือลบประเภทการลาที่ใช้ในระบบ
              </p>
            </div>
            <div className="text-xs text-slate-400">
              ทั้งหมด{" "}
              <span className="font-semibold text-sky-300">
                {leaveTypes.length}
              </span>{" "}
              ประเภท
            </div>
          </div>
        </div>

        <Panel className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
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
              <span className="text-sm text-slate-100">
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
          <div className="overflow-x-auto rounded-2xl border border-slate-700/70 bg-slate-950/40">
            <table className="min-w-full text-sm text-slate-100">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700/70">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    ชื่อประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    ลาในระบบได้
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-slate-400"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : leaveTypes.length > 0 ? (
                  leaveTypes.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={`${
                        idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                      } border-b border-slate-800/60 hover:bg-slate-800/60 transition`}
                    >
                      <td className="px-4 py-2 text-slate-300">{t.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-100">
                        {t.name}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.isAvailable
                              ? "bg-emerald-500/10 border border-emerald-400/40 text-emerald-200"
                              : "bg-slate-700/40 border border-slate-500/60 text-slate-200"
                          }`}
                        >
                          {t.isAvailable ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(t.id)}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-50 px-3 py-1.5 rounded-xl text-xs shadow-[0_10px_25px_rgba(15,23,42,0.9)]"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-slate-50 px-3 py-1.5 rounded-xl text-xs shadow-[0_10px_25px_rgba(127,29,29,0.9)]"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-slate-300"
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
