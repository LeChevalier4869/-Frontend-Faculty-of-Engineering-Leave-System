import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 8;

export default function HolidayManage() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    fiscalYear: "",
    isRecurring: false,
    holidayType: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const authHeader = () => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
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
      const res = await axios.get(`${BASE_URL}/admin/holidays`, authHeader());
      setHolidays(res.data.data);
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
    setForm({ date: "", description: "", fiscalYear: "", isRecurring: false, holidayType: "" });
    setEditId(null);
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = async () => {
    const { date, description, fiscalYear } = form;
    if (!date || !description || !fiscalYear) {
      return Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบ", "error");
    }
    try {
      await axios.post(`${BASE_URL}/admin/holiday`, form, authHeader());
      Swal.fire("เพิ่มวันหยุดสำเร็จ!", "", "success");
      resetForm();
      loadData();
      setCurrentPage(1);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (id) => {
    const item = holidays.find((h) => h.id === id);
    setForm({
      date: item.date.split("T")[0],
      description: item.description,
      fiscalYear: item.fiscalYear,
      isRecurring: item.isRecurring,
      holidayType: item.holidayType || "",
    });
    setEditId(id);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE_URL}/admin/holiday/${editId}`, form, authHeader());
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
      await axios.delete(`${BASE_URL}/admin/holiday/${id}`, authHeader());
      Swal.fire("ลบสำเร็จ!", "", "success");
      const pageCount = Math.ceil(holidays.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const totalPages = Math.ceil(holidays.length / PAGE_SIZE);
  const displayed = holidays.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการวันหยุด</h1>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleInput}
            className="col-span-1 md:col-span-1 border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="description"
            placeholder="คำอธิบาย"
            value={form.description}
            onChange={handleInput}
            className="col-span-1 md:col-span-2 border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="fiscalYear"
            placeholder="ปีงบประมาณ"
            value={form.fiscalYear}
            onChange={handleInput}
            className="col-span-1 md:col-span-1 border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="holidayType"
            placeholder="ประเภท (ถ้ามี)"
            value={form.holidayType}
            onChange={handleInput}
            className="col-span-1 md:col-span-1 border px-3 py-2 rounded"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleInput}
            />
            <span>วนซ้ำ</span>
          </label>
        </div>
        <button
          onClick={editId ? handleUpdate : handleAdd}
          className={`${
            editId ? "bg-yellow-600" : "bg-green-600"
          } text-white px-4 py-2 rounded-lg`}
        >
          {editId ? "อัปเดต" : "เพิ่ม"}
        </button>

        {/* Table */}
        <div className="overflow-x-auto mt-6 rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm text-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">วันที่</th>
                <th className="px-4 py-2">คำอธิบาย</th>
                <th className="px-4 py-2">ปีงบ</th>
                <th className="px-4 py-2">ประเภท</th>
                <th className="px-4 py-2">วนซ้ำ</th>
                <th className="px-4 py-2 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">กำลังโหลด...</td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((h, idx) => (
                  <tr key={h.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2">{h.id}</td>
                    <td className="px-4 py-2">{h.date.split("T")[0]}</td>
                    <td className="px-4 py-2">{h.description}</td>
                    <td className="px-4 py-2">{h.fiscalYear}</td>
                    <td className="px-4 py-2">{h.holidayType || "-"}</td>
                    <td className="px-4 py-2 text-center">{h.isRecurring ? "✓" : "-"}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(h.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6">ไม่มีข้อมูลวันหยุด</td>
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
