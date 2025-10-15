import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

export default function LeaveTypeManage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [name, setName] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ปรับขนาดฟิลด์และปุ่ม
  const inputClass =
    "col-span-2 border border-gray-300 rounded-lg px-3 py-2 bg-white text-base text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const checkboxClass = "w-5 h-5 text-gray-700";
  const buttonClass =
    "text-white text-base px-4 py-2 rounded-lg transition";

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
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          จัดการประเภทการลา
        </h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="ชื่อประเภทการลา"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
              className={checkboxClass}
            />
            <span className="text-base">ลาในระบบได้</span>
          </label>
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`${buttonClass} ${editId ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-600 hover:bg-gray-700"
              }`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow border border-gray-300 rounded-lg">
          <table className="min-w-full text-sm text-black bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">ชื่อ</th>
                <th className="px-3 py-2">ลาในระบบได้</th>
                <th className="px-3 py-2 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : leaveTypes.length > 0 ? (
                leaveTypes.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2">{t.id}</td>
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2 text-center">
                      {t.isAvailable ? "✅" : "❌"}
                    </td>
                    <td className="px-3 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(t.id)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    ไม่มีข้อมูลประเภทการลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
