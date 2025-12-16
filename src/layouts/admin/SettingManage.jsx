import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 10;

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
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
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400";
  const dropdownClass =
    "w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400";
  const wrapperClass = "relative w-full";

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
      setSettings(res.data || []);
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
    if (!setting) return;
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
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.key.toLowerCase().includes(q) ||
        s.value.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการการตั้งค่าระบบ
              </h1>
              <p className="text-sm text-slate-600">
                เพิ่ม แก้ไข หรือลบค่า setting ของระบบจากหน้านี้ได้โดยตรง
              </p>
            </div>
            <div className="text-xs text-slate-500 mt-1 md:mt-0">
              พบ{" "}
              <span className="font-semibold text-sky-600">
                {filteredSettings.length}
              </span>{" "}
              รายการ
            </div>
          </div>
        </div>

        <Panel className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div className="sm:col-span-1 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Key
              </label>
              <input
                type="text"
                placeholder="กรอก Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-1 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Value
              </label>
              <input
                type="text"
                placeholder="กรอก Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                คำอธิบาย
              </label>
              <input
                type="text"
                placeholder="คำอธิบาย (ไม่บังคับ)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-1 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Type
              </label>
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
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={editId ? handleUpdate : handleAdd}
              className={`inline-flex items-center justify-center rounded-xl text-sm font-medium text-white shadow-sm px-4 py-2 ${
                editId
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-sky-600 hover:bg-sky-500"
              }`}
            >
              {editId ? "อัปเดต" : "เพิ่ม"}
            </button>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              แสดงผลตามตัวกรองด้านขวา
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="ค้นหา Key / Value / คำอธิบาย"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
              />
              <div className="relative w-full sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={dropdownClass}
                >
                  <option value="ALL">ประเภททั้งหมด</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="json">JSON</option>
                </select>
                <ArrowIcon />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    คำอธิบาย
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Type
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
                      colSpan={6}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : displayed.length > 0 ? (
                  displayed.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50 transition-colors`}
                    >
                      <td className="px-4 py-2 text-slate-600">{s.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {s.key}
                      </td>
                      <td className="px-4 py-2 text-slate-800">{s.value}</td>
                      <td className="px-4 py-2 text-slate-700">
                        {s.description || "ไม่มี"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(s.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
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
                      colSpan={6}
                      className="text-center py-6 text-sm text-slate-500"
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
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ก่อนหน้า
              </button>
              <span className="px-3 py-1 text-xs text-slate-700">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
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
