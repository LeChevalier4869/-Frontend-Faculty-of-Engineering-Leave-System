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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => {
          window.location.href = "/login";
        }
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => {
          window.location.href = "/login";
        }
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
      setDepartments(deptRes.data.data || []);
      setOrganizations(orgRes.data.data || []);
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
        {
          name: newName,
          organizationId: +newOrgId,
          headId: newHeadId ? +newHeadId : null,
        },
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
    if (!dept) return;
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
        {
          name: newName,
          organizationId: +editOrgId,
          headId: editHeadId ? +editHeadId : null,
        },
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

  const filteredDepartments = selectedOrgFilter
    ? departments.filter((d) => d.organizationId === +selectedOrgFilter)
    : departments;

  const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayed = filteredDepartments.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

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
                จัดการแผนก
              </h1>
              <p className="text-sm text-slate-600">
                เพิ่ม แก้ไข หรือลบข้อมูลแผนก และกำหนดหัวหน้าแผนกตามหน่วยงาน
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="กรอกชื่อแผนก"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`${inputBase} col-span-2`}
            />

            <div className="relative w-full">
              <select
                value={editId ? editOrgId ?? "" : newOrgId}
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
                className={`${inputBase} pr-8 appearance-none`}
              >
                <option value="">เลือกหน่วยงาน</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="relative w-full">
              <select
                value={editId ? editHeadId : newHeadId}
                onChange={(e) =>
                  editId
                    ? setEditHeadId(e.target.value)
                    : setNewHeadId(e.target.value)
                }
                className={`${inputBase} pr-8 appearance-none`}
              >
                <option value="">เลือกหัวหน้าแผนก (ไม่ระบุก็ได้)</option>
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={editId ? handleUpdate : handleAdd}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                editId
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-sky-600 hover:bg-sky-500"
              }`}
            >
              {editId ? "อัปเดตแผนก" : "เพิ่มแผนก"}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">
                กรองตามหน่วยงาน:
              </span>
              <div className="relative w-full sm:w-56">
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => {
                    setSelectedOrgFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`${inputBase} pr-8 appearance-none`}
                >
                  <option value="">-- แสดงทั้งหมด --</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[6%]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ชื่อแผนก
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    หน่วยงาน
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    หัวหน้าแผนก
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold w-[18%]">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : displayed.length > 0 ? (
                  displayed.map((d, idx) => (
                    <tr
                      key={d.id}
                      className={`border-t border-slate-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50`}
                    >
                      <td className="px-4 py-2">{startIndex + idx + 1}</td>
                      <td className="px-4 py-2">{d.name}</td>
                      <td className="px-4 py-2">
                        {organizations.find(
                          (org) => org.id === d.organizationId
                        )?.name || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {d.head
                          ? `${d.head.firstName} ${d.head.lastName}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(d.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-slate-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
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
                      colSpan={5}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ยังไม่มีข้อมูลแผนก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
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
                setCurrentPage((p) => Math.min(p + 1, totalPages))
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
  );
}
