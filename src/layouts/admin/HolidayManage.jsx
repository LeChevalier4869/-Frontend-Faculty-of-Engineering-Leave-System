import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const PAGE_SIZE = 8;

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
  const [sortOrder, setSortOrder] = useState("asc"); // เพิ่ม state สำหรับการเรียงลำดับ

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
        {
          date,
          description,
          isRecurring,
          holidayType,
        },
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
        {
          date,
          description,
          isRecurring,
          holidayType,
        },
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

  // กรองตามประเภท และการเรียงตามวัน
  const filtered = (filterType
    ? holidays.filter((h) => h.holidayType === filterType)
    : holidays
  ).sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.date) - new Date(b.date); // เก่าสุดไปล่าสุด
    } else {
      return new Date(b.date) - new Date(a.date); // ล่าสุดไปเก่าสุด
    }
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการวันหยุด</h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            placeholder="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={holidayType}
            onChange={(e) => setHolidayType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">เลือกประเภท</option>
            <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
            <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
            <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
            ประจำทุกปี
          </label>
        </div>

        {/* Button and Dropdown for Filter & Sort */}
        <div className="mb-6 flex justify-between items-center flex-col sm:flex-row gap-2">
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`${
              editId ? "bg-gray-700" : "bg-gray-700"
            } hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">-- เรียงตามประเภททั้งหมด --</option>
              <option value="หยุดนักขัตฤกษ์">หยุดนักขัตฤกษ์</option>
              <option value="หยุดราชการพิเศษ">หยุดราชการพิเศษ</option>
              <option value="วันสำคัญอื่น ๆ">วันสำคัญอื่น ๆ</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="asc">เรียงจากต้นปี</option>
              <option value="desc">เรียงจากท้ายปี</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">รายละเอียด</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ประจำปี</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
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
                    <td className="px-4 py-2">{h.id}</td>
                    <td className="px-4 py-2">{h.date.split("T")[0]}</td>
                    <td className="px-4 py-2">{h.description}</td>
                    <td className="px-4 py-2">{h.holidayType || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      {h.isRecurring ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(h.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
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
                  <td colSpan="6" className="text-center py-6 text-black">
                    ยังไม่มีข้อมูลวันหยุด
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
