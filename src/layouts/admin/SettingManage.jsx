import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 10;

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl overflow-hidden bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

export default function SettingManage() {
  const [settings, setSettings] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const inputClass =
    "col-span-2 border border-sky-500/30 rounded-xl px-3 py-2 bg-slate-900/70 text-sm text-slate-100 shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:outline-none focus:ring-2 focus:ring-sky-400/70 placeholder:text-slate-500";
  const dropdownClass =
    "appearance-none col-span-2 bg-slate-900/70 text-sm text-slate-100 border border-sky-500/30 rounded-xl px-3 py-2 shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:outline-none focus:ring-2 focus:ring-sky-400/70 w-full";
  const wrapperClass = "relative col-span-2 w-full";

  const ArrowIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

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
      const res = await axios.get(`${BASE_URL}/admin/setting`, authHeader());
      setSettings(res.data);
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
    setNewKey("");
    setNewType("");
    setNewValue("");
    setDescription("");
    setEditId(null);
  };

  const handleAdd = async () => {
    if (!newKey || !newValue || !newType) {
      return Swal.fire("Error", "ต้องระบุ key, type และ value", "error");
    }
    try {
      await axios.post(
        `${BASE_URL}/admin/setting`,
        { key: newKey, type: newType, value: newValue, description },
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
    const setting = settings.find((s) => s.id === id);
    setNewKey(setting.key);
    setNewType(setting.type);
    setNewValue(setting.value);
    setDescription(setting.description || "");
    setEditId(id);
  };

  const handleUpdate = async () => {
    if (!newKey || !newValue || !newType) {
      return Swal.fire("Error", "ต้องระบุ key, type และ value", "error");
    }
    try {
      await axios.put(
        `${BASE_URL}/admin/setting/${editId}`,
        { key: newKey, type: newType, value: newValue, description },
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
      await axios.delete(`${BASE_URL}/admin/setting/${id}`, authHeader());
      Swal.fire("ลบสำเร็จ!", "", "success");
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const filteredSettings = useMemo(() => {
    return settings.filter((s) => {
      const matchesSearch =
        s.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "ALL" ||
        s.type.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [settings, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredSettings.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filteredSettings.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] px-4 py-8 md:px-8 font-kanit text-slate-100 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.35)] w-fit">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-100">
              System Settings
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
            จัดการการตั้งค่าระบบ
          </h1>
          <p className="text-sm text-slate-300">
            เพิ่ม แก้ไข หรือลบค่า setting ของระบบจากหน้านี้ได้โดยตรง
          </p>
        </div>

        <Panel className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <input
              type="text"
              placeholder="กรอก Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="กรอก Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="คำอธิบาย (ไม่บังคับ)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
            <div className={wrapperClass}>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className={dropdownClass}
              >
                <option value="">เลือก Type</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="json">JSON</option>
              </select>
              <ArrowIcon />
            </div>
            <button
              onClick={editId ? handleUpdate : handleAdd}
              className={`${
                editId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-sky-600 hover:bg-sky-500"
              } text-white text-sm px-4 py-2 rounded-xl shadow-[0_12px_32px_rgba(8,47,73,0.85)] transition mt-2 sm:mt-0`}
            >
              {editId ? "อัปเดต" : "เพิ่ม"}
            </button>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">
              พบ{" "}
              <span className="font-semibold text-sky-300">
                {filteredSettings.length}
              </span>{" "}
              รายการ
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="ค้นหา Key / Value / คำอธิบาย"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-sky-500/30 rounded-xl px-3 py-2 bg-slate-900/70 text-sm text-slate-100 shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:ring-2 focus:ring-sky-400/70 w-full"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-sky-500/30 rounded-xl px-3 py-2 bg-slate-900/70 text-sm text-slate-100 shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:ring-2 focus:ring-sky-400/70 w-full sm:w-48"
              >
                <option value="ALL">ประเภททั้งหมด</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700/70 bg-slate-950/40">
            <table className="min-w-full text-sm text-slate-100">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700/70">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    คำอธิบาย
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Type
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
                      colSpan="6"
                      className="text-center py-6 text-slate-400"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : displayed.length > 0 ? (
                  displayed.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`${
                        idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                      } border-b border-slate-800/60 hover:bg-slate-800/60 transition`}
                    >
                      <td className="px-4 py-2 text-slate-300">{s.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-100">
                        {s.key}
                      </td>
                      <td className="px-4 py-2 text-slate-200">{s.value}</td>
                      <td className="px-4 py-2 text-slate-300">
                        {s.description || "ไม่มี"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-sky-500/10 border border-sky-400/40 text-sky-200">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(s.id)}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-50 px-3 py-1.5 rounded-xl text-xs shadow-[0_10px_25px_rgba(15,23,42,0.9)]"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
                      colSpan="6"
                      className="text-center py-6 text-slate-300"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-600 rounded-xl bg-slate-900/70 text-slate-100 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
              >
                ก่อนหน้า
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-200">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-600 rounded-xl bg-slate-900/70 text-slate-100 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/80"
              >
                ถัดไป
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
