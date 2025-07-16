import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";
import { ChevronDown } from "lucide-react";

const PAGE_SIZE = 10;

export default function DepartmentManage() {
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [newHeadId, setNewHeadId] = useState("");
  const [editId, setEditId] = useState(null);
  const [editOrgId, setEditOrgId] = useState(null);
  const [editHeadId, setEditHeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState("");

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => { window.location.href = "/login"; }
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => { window.location.href = "/login"; }
      );
    } else {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, orgRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/departmentsList`, authHeader()),
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

  const loadUsersByOrganizationId = async (organizationId) => {
    if (!organizationId) {
      setFilteredUsers([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/users?organizationId=${organizationId}`,
        authHeader()
      );
      setFilteredUsers(res.data.data || []);
    } catch (err) {
      handleApiError(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setNewName("");
    setNewOrgId("");
    setNewHeadId("");
    setEditId(null);
    setEditOrgId(null);
    setEditHeadId("");
    setFilteredUsers([]);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newOrgId) {
      return Swal.fire("Error", "ต้องระบุชื่อแผนกและเลือกหน่วยงาน", "error");
    }
    try {
      await axios.post(
        `${BASE_URL}/admin/departments`,
        { name: newName, organizationId: +newOrgId, headId: newHeadId ? +newHeadId : null },
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
    setEditHeadId(dept.headId || "");
    loadUsersByOrganizationId(dept.organizationId);
  };

  const handleUpdate = async () => {
    if (!newName.trim() || !editOrgId) {
      return Swal.fire("Error", "ต้องระบุชื่อแผนกและเลือกหน่วยงาน", "error");
    }
    try {
      await axios.put(
        `${BASE_URL}/admin/departments/${editId}`,
        { name: newName, organizationId: +editOrgId, headId: editHeadId ? +editHeadId : null },
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

  // กรองตาม org filter
  const filteredDepartments = selectedOrgFilter
    ? departments.filter((d) => d.organizationId === +selectedOrgFilter)
    : departments;

  const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filteredDepartments.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการแผนก</h1>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="กรอกชื่อแผนก"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {/* Organization dropdown */}
          <div className="relative w-full">
            <select
              value={editId ? editOrgId : newOrgId}
              onChange={(e) => {
                const id = e.target.value;
                if (editId) {
                  setEditOrgId(id);
                  loadUsersByOrganizationId(id);
                } else {
                  setNewOrgId(id);
                  loadUsersByOrganizationId(id);
                }
              }}
              className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">เลือกหน่วยงาน</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="w-4 h-4 text-black" />
            </div>
          </div>

          {/* Head dropdown */}
          <div className="relative w-full">
            <select
              value={editId ? editHeadId : newHeadId}
              onChange={(e) => editId ? setEditHeadId(e.target.value) : setNewHeadId(e.target.value)}
              className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">เลือกหัวหน้าแผนก (ไม่ระบุก็ได้)</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center flex-col sm:flex-row gap-2">
          <button
            onClick={editId ? handleUpdate : handleAdd}
            className={`col-span-1 ${editId ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-2 rounded-lg transition-all`}
          >
            {editId ? "อัปเดต" : "เพิ่ม"}
          </button>

          {/* Filter by Organization */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-black whitespace-nowrap">
              กรองตามหน่วยงาน:
            </label>
            <div className="relative w-full sm:w-48">
              <select
                value={selectedOrgFilter}
                onChange={(e) => {
                  setSelectedOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">-- แสดงทั้งหมด --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">ชื่อแผนก</th>
                <th className="px-4 py-3">หน่วยงาน</th>
                <th className="px-4 py-3">หัวหน้าแผนก</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : displayed.length > 0 ? (
                displayed.map((d, idx) => (
                  <tr key={d.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}>
                    {/* <td className="px-4 py-2">{d.id}</td> */}
                    <td className="px-4 py-2">{startIndex + idx + 1}</td>
                    <td className="px-4 py-2">{d.name}</td>
                    <td className="px-4 py-2">
                      {organizations.find(org => org.id === d.organizationId)?.name || "-"}
                    </td>
                    <td className="px-4 py-2">{d.head ? `${d.head.firstName} ${d.head.lastName}` : "-"}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => handleEdit(d.id)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm">
                        แก้ไข
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-black">
                    ยังไม่มีข้อมูลแผนก
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
              className="px-3 py-1 rounded bg-white border text-black disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1 text-black">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white border text-black disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
