import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../utils/api";

const PAGE_SIZE = 8;

export default function DepartmentManage() {
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [newName, setNewName] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [editId, setEditId] = useState(null);
  const [editOrgId, setEditOrgId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(() => {
        window.location.href = "/login";
      });
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(() => {
        window.location.href = "/login";
      });
    } else {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, orgRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/departments`, authHeader()),
        axios.get(`${BASE_URL}/admin/organizations`, authHeader()),
      ]);
      setDepartments(deptRes.data.data);
      setOrganizations(orgRes.data.data);
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
    setNewOrgId("");
    setEditId(null);
    setEditOrgId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newOrgId) {
      return Swal.fire("Error", "ต้องระบุชื่อแผนกและเลือกหน่วยงาน", "error");
    }
    try {
      await axios.post(
        `${BASE_URL}/admin/departments`,
        { name: newName, organizationId: +newOrgId },
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
    const dept = departments.find((d) => d.id === id);
    setNewName(dept.name);
    setEditId(dept.id);
    setEditOrgId(dept.organizationId);
  };

  const handleUpdate = async () => {
    if (!newName.trim() || !editOrgId) {
      return Swal.fire("Error", "ต้องระบุชื่อแผนกและเลือกหน่วยงาน", "error");
    }
    try {
      await axios.put(
        `${BASE_URL}/admin/departments/${editId}`,
        { name: newName, organizationId: +editOrgId },
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
      await axios.delete(`${BASE_URL}/admin/departments/${id}`, authHeader());
      Swal.fire("ลบสำเร็จ!", "ข้อมูลแผนกถูกลบแล้ว", "success");
      const pageCount = Math.ceil(departments.length / PAGE_SIZE);
      if (currentPage > pageCount) setCurrentPage(pageCount);
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const totalPages = Math.ceil(departments.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = departments.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">จัดการแผนก</h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="กรอกชื่อแผนก"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <div className="relative">
            <select
              value={editId ? editOrgId : newOrgId}
              onChange={(e) => editId ? setEditOrgId(e.target.value) : setNewOrgId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none"
            >
              <option value="">เลือกหน่วยงาน</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg
                className="h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`col-span-1 ${editId ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-2 rounded-lg transition-all`}
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
                <th className="px-4 py-3">ชื่อแผนก</th>
                <th className="px-4 py-3">หน่วยงาน</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">กำลังโหลด...</td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((d, idx) => (
                  <tr key={d.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                    <td className="px-4 py-2">{d.id}</td>
                    <td className="px-4 py-2">{d.name}</td>
                    <td className="px-4 py-2">{d.organization?.name || '-'}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => handleEdit(d.id)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm">แก้ไข</button>
                      <button onClick={() => handleDelete(d.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-black">ยังไม่มีข้อมูลแผนก</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50">ก่อนหน้า</button>
            <span className="px-3 py-1 text-black">หน้า {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50">ถัดไป</button>
          </div>
        )}
      </div>
    </div>
  );
}