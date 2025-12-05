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

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400";
  const selectBase =
    "appearance-none w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400";
  const selectWrapper = "relative w-full";

  const ArrowIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500">
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
      setHolidays(res.data.data || []);
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
    if (!h) return;
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

  const filtered = (
    filterType
      ? holidays.filter((h) => h.holidayType === filterType)
      : holidays
  ).sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  const filteredByYear = filtered.filter(
    (h) => new Date(h.date).getFullYear() === selectedYear
  );

  const totalPages = Math.ceil(filteredByYear.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filteredByYear.slice(startIndex, startIndex + PAGE_SIZE);

  const yearsSet = new Set(
    holidays.map((h) => new Date(h.date).getFullYear())
  );
  if (yearsSet.size === 0) {
    yearsSet.add(new Date().getFullYear());
  }
  const years = Array.from(yearsSet).sort((a, b) => b - a);

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
                จัดการวันหยุด
              </h1>
              <p className="text-sm text-slate-600">
                เพิ่ม แก้ไข และจัดการวันหยุดราชการ หรือนักขัตฤกษ์สำหรับระบบลา
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputBase}
              />
            </div>
            <div className="sm:col-span-1 md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                รายละเอียด
              </label>
              <input
                type="text"
                placeholder="รายละเอียดวันหยุด"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ประเภทวันหยุด
              </label>
              <div className={selectWrapper}>
                <select
                  value={holidayType}
                  onChange={(e) => setHolidayType(e.target.value)}
                  className={selectBase}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
                  <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
                  <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(!isRecurring)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>ประจำทุกปี</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={editId ? handleUpdate : handleAdd}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-xs md:text-sm font-medium text-white shadow-sm transition hover:bg-sky-500"
                >
                  {editId ? "อัปเดตวันหยุด" : "เพิ่มวันหยุด"}
                </button>
                <button
                  onClick={resetForm}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-3 py-2 text-xs md:text-sm font-medium text-white shadow-sm transition hover:bg-rose-400"
                >
                  ล้างฟอร์ม
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                ตัวกรองข้อมูลวันหยุด
              </p>
              <p className="text-xs text-slate-500">
                เลือกปี ประเภท และรูปแบบการเรียงข้อมูลที่ต้องการ
              </p>
            </div>
            <button
              onClick={() => {
                setFilterType("");
                setSortOrder("asc");
                setSelectedYear(new Date().getFullYear());
                setCurrentPage(1);
              }}
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm transition hover:bg-rose-400 self-start"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ปีที่ต้องการแสดง
              </label>
              <div className={selectWrapper}>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={selectBase}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ประเภทวันหยุด
              </label>
              <div className={selectWrapper}>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={selectBase}
                >
                  <option value="">ทุกประเภท</option>
                  <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
                  <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
                  <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                การเรียงลำดับ
              </label>
              <div className={selectWrapper}>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={selectBase}
                >
                  <option value="asc">เรียงจากต้นปี</option>
                  <option value="desc">เรียงจากท้ายปี</option>
                </select>
                <ArrowIcon />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[8%]">
                    ลำดับ
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันที่
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    รายละเอียด
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภท
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold w-[10%]">
                    ประจำปี
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold w-[18%]">
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
                  displayed.map((h, idx) => (
                    <tr
                      key={h.id}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50 transition-colors`}
                    >
                      <td className="px-3 py-2 text-sm">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {h.date.split("T")[0]}
                      </td>
                      <td className="px-3 py-2 text-sm">{h.description}</td>
                      <td className="px-3 py-2 text-sm">
                        {h.holidayType || "-"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {h.isRecurring ? "✅" : "❌"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(h.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-slate-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-rose-400"
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
                      ยังไม่มีข้อมูลวันหยุดในปี {selectedYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ก่อนหน้า
              </button>
              <span className="text-sm text-slate-700">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
