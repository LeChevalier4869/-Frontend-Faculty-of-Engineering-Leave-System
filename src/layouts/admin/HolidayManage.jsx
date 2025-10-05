import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 10;

export default function HolidayManage() {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [holidayType, setHolidayType] = useState("");
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const inputClass =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const dropdownClass =
    "appearance-none w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const wrapperClass = "relative w-full";

  const ArrowIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
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
      const res = await axios.get(`${BASE_URL}/admin/holiday`, authHeader());
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
    setDate("");
    setDescription("");
    setIsRecurring(false);
    setHolidayType("");
    setEditId(null);
  };

  const handleAdd = async () => {
    if (!date || !description.trim()) {
      return Swal.fire("Error", "กรุณาระบุข้อมูลให้ครบถ้วน", "error");
    }
    try {
      await axios.post(
        `${BASE_URL}/admin/holiday`,
        { date, description, isRecurring, holidayType },
        authHeader()
      );
      Swal.fire("เพิ่มวันหยุดสำเร็จ", "", "success");
      resetForm();
      loadData();
      setCurrentPage(1);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (id) => {
    const h = holidays.find((x) => x.id === id);
    setDate(h.date.split("T")[0]);
    setDescription(h.description);
    setIsRecurring(h.isRecurring);
    setHolidayType(h.holidayType || "");
    setEditId(id);
  };

  const handleUpdate = async () => {
    if (!date || !description.trim()) {
      return Swal.fire("Error", "กรุณาระบุข้อมูลให้ครบถ้วน", "error");
    }
    try {
      await axios.put(
        `${BASE_URL}/admin/holiday/${editId}`,
        { date, description, isRecurring, holidayType },
        authHeader()
      );
      Swal.fire("อัปเดตสำเร็จ", "", "success");
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
      Swal.fire("ลบสำเร็จ", "", "success");
      const pageCount = Math.ceil(holidays.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  // Filter & Sort
  const filtered = (
    filterType ? holidays.filter((h) => h.holidayType === filterType) : holidays
  ).sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  // Filter by selectedYear
  const filteredByYear = filtered.filter(
    (h) => new Date(h.date).getFullYear() === selectedYear
  );

  const totalPages = Math.ceil(filteredByYear.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filteredByYear.slice(startIndex, startIndex + PAGE_SIZE);

  // ดึงปีทั้งหมดจากข้อมูลวันหยุด และ remove duplicates
  const years = Array.from(
    new Set(holidays.map((h) => new Date(h.date).getFullYear()))
  ).sort((a, b) => b - a); // เรียงจากปีล่าสุดลงไป

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการวันหยุด</h1>

        {/* Form */}
        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />

          {/* holidayType dropdown */}
          <div className={wrapperClass}>
            <select
              value={holidayType}
              onChange={(e) => setHolidayType(e.target.value)}
              className={dropdownClass}
            >
              <option value="">เลือกประเภท</option>
              <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
              <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
              <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
            </select>
            <ArrowIcon />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                className="w-5 h-5 accent-gray-700"
              />
              <span className="text-base">ประจำทุกปี</span>
            </label>

            {/* ล้างแบบฟอร์ม */}
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              ล้างแบบฟอร์ม
            </button>
          </div>
        </div>

        {/* Button + Filter & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {/* เพิ่ม/อัปเดต */}
            <button
              onClick={editId ? handleUpdate : handleAdd}
              className="bg-gray-700 hover:bg-gray-800 text-white text-base px-5 py-2 rounded-lg transition flex-shrink-0"
            >
              {editId ? "อัปเดต" : "เพิ่ม"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Filter type */}
            <div className={`${wrapperClass} flex-1 min-w-[150px]`}>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className={dropdownClass}
              >
                <option value="">-- ทุกประเภท --</option>
                <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
                <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
                <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
              </select>
              <ArrowIcon />
            </div>

            {/* Sort order */}
            <div className={`${wrapperClass} flex-1 min-w-[130px]`}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={dropdownClass}
              >
                <option value="asc">เรียงจากต้นปี</option>
                <option value="desc">เรียงจากท้ายปี</option>
              </select>
              <ArrowIcon />
            </div>

            {/* Year selection */}
            <div className={`${wrapperClass} flex-1 min-w-[70px]`}>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={dropdownClass}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ArrowIcon />
            </div>

            {/* ล้างตัวกรอง */}
            <button
              onClick={() => {
                setFilterType("");
                setSortOrder("asc");
                setSelectedYear(new Date().getFullYear());
                setCurrentPage(1);
              }}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition min-w-[130px]"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">ลำดับ</th>
                <th className="px-3 py-2 text-left">วันที่</th>
                <th className="px-3 py-2 text-left">รายละเอียด</th>
                <th className="px-3 py-2 text-left">ประเภท</th>
                <th className="px-3 py-2">ประจำปี</th>
                <th className="px-3 py-2 text-center">การจัดการ</th>
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
                displayed.map((h, idx) => (
                  <tr
                    key={h.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2">{startIndex + idx + 1}</td>
                    <td className="px-3 py-2">{h.date.split("T")[0]}</td>
                    <td className="px-3 py-2">{h.description}</td>
                    <td className="px-3 py-2">{h.holidayType || "-"}</td>
                    <td className="px-3 py-2 text-center">
                      {h.isRecurring ? "✅" : "❌"}
                    </td>
                    <td className="px-3 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(h.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    ยังไม่มีข้อมูลวันหยุดในปี {selectedYear}
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
              className="px-2 py-1 border rounded-lg bg-white disabled:opacity-50 text-sm"
            >
              ก่อนหน้า
            </button>
            <span className="px-2 py-1 text-sm">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded-lg bg-white disabled:opacity-50 text-sm"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
