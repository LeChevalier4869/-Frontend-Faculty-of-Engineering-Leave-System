import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 10;

export default function SettingManage() {
  const [settings, setSettings] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ปรับขนาดฟิลด์ให้เล็กลง
  const inputClass =
    "col-span-2 border border-gray-300 rounded-lg px-3 py-2 bg-white text-base text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const dropdownClass =
    "appearance-none col-span-2 bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full";
  const wrapperClass = "relative col-span-2 w-full";

  const ArrowIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
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
    if (!newKey.trim() || !newValue.trim() || !newType.trim()) {
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
    if (!newKey.trim() || !newValue.trim() || !newType.trim()) {
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
      Swal.fire("ลบสำเร็จ!", "ข้อมูลการตั้งค่าถูกลบแล้ว", "success");
      const pageCount = Math.ceil(settings.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const totalPages = Math.ceil(settings.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = settings.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          จัดการการตั้งค่า
        </h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
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

          {/* Type dropdown */}
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
              editId
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white text-base px-4 py-2 rounded-lg transition`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">คำอธิบาย</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-2">{s.id}</td>
                    <td className="px-4 py-2">{s.key}</td>
                    <td className="px-4 py-2">{s.value}</td>
                    <td className="px-4 py-2">{s.description || "ไม่มี"}</td>
                    <td className="px-4 py-2">{s.type}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(s.id)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-black">
                    ยังไม่มีการตั้งค่า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && ( 
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1 text-black">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
