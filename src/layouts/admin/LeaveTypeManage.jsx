import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

export default function LeaveTypeManage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [name, setName] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const res = await axios.get(`${BASE_URL}/leave-types/`, authHeader());
      setLeaveTypes(res.data);
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
    setIsAvailable(true);
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
        <h1 className="text-3xl font-bold mb-6 text-center">จัดการประเภทการลา</h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="ชื่อประเภทการลา"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-2 border border-gray-300 rounded-lg px-4 py-2"
          />
          <select
            value={isAvailable ? "true" : "false"}
            onChange={(e) => setIsAvailable(e.target.value === "true")}
            className="col-span-1 border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="true">เปิดใช้งาน</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`${
              editId ? "bg-gray-700" : "bg-green-600"
            } text-white px-4 py-2 rounded-lg hover:opacity-90`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow border border-gray-300 rounded-lg">
          <table className="min-w-full text-sm text-black bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
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
                leaveTypes.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{t.id}</td>
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">
                      {t.isAvailable ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(t.id)}
                        className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-black">
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
