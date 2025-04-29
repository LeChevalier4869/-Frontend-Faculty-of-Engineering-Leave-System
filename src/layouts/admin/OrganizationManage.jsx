import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";
import { apiEndpoints } from "../../utils/api";

const PAGE_SIZE = 8;

export default function OrganizationManage() {
  const [organizations, setOrganizations] = useState([]);
  const [newName, setNewName] = useState("");
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
      const res = await axios.get(`${BASE_URL}/admin/organizations`, authHeader());
      setOrganizations(res.data.data);
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
    setNewName("");
    setEditId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      return Swal.fire("Error", "ต้องระบุชื่อหน่วยงาน", "error");
    }
    console.log("Adding organization:", newName);
    try {
      await axios.post(
        apiEndpoints.organizationCreate,
        { name: newName },
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
    const org = organizations.find((o) => o.id === id);
    setNewName(org.name);
    setEditId(org.id);
  };

  const handleUpdate = async () => {
    if (!newName.trim()) {
      return Swal.fire("Error", "ต้องระบุชื่อหน่วยงาน", "error");
    }
    try {
      await axios.put(
        apiEndpoints.organizationUpdate(editId),
        { name: newName },
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
      await axios.delete(`${BASE_URL}/admin/organizations/${id}`, authHeader());
      Swal.fire("ลบสำเร็จ!", "ข้อมูลหน่วยงานถูกลบแล้ว", "success");
      const pageCount = Math.ceil(organizations.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const totalPages = Math.ceil(organizations.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = organizations.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการหน่วยงาน</h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="กรอกชื่อหน่วยงาน"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`${
              editId
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white px-4 py-2 rounded-lg transition-all`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">ชื่อหน่วยงาน</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((o, idx) => (
                  <tr
                    key={o.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-2">{o.id}</td>
                    <td className="px-4 py-2">{o.name}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(o.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-black">
                    ยังไม่มีข้อมูลหน่วยงาน
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
