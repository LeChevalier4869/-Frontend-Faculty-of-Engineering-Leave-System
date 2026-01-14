// src/pages/admin/UserManage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import { FiUser, FiUsers } from "react-icons/fi";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 200;

const MySwal = withReactContent(Swal);

function UserManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(
      () => setKeyword(searchInput.trim().toLowerCase()),
      DEBOUNCE_MS
    );
    return () => clearTimeout(id);
  }, [searchInput]);

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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiEndpoints.userLanding, authHeader());
      setUsers(res.data.user || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
      await axios.delete(apiEndpoints.deleteUserByAdmin(id), authHeader());
      Swal.fire("ลบสำเร็จ!", "ข้อมูลผู้ใช้งานถูกลบแล้ว", "success");
      loadUsers();
    } catch (err) {
      handleApiError(err);
    }
  };

  const filtered = !keyword
    ? users
    : users.filter((u) =>
        `${u.prefixName ?? ""} ${u.firstName ?? ""} ${u.lastName ?? ""}`
          .toLowerCase()
          .includes(keyword)
      );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayedUsers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


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
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการผู้ใช้งาน
              </h1>
              <p className="text-sm text-slate-600">
                ดูรายการผู้ใช้งาน ค้นหา แก้ไข หรือลบข้อมูลผู้ใช้งานในระบบ
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาชื่อ..."
                className="w-full md:w-64 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {navigate("/admin/add-user");}}
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 whitespace-nowrap"
                >
                  + เพิ่มผู้ใช้งาน
                </button>
                {loading && (
                  <span className="text-xs text-slate-500">กำลังโหลด...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed bg-white text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[20%]">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[22%]">
                    อีเมล
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[18%]">
                    แผนก
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[18%]">
                    ประเภทบุคลากร
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[12%]">
                    เบอร์โทร
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold w-[15%]">
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
                ) : displayedUsers.length ? (
                  displayedUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/admin/user-info/${user.id}`)}
                      className={`cursor-pointer border-t border-slate-100 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50`}
                    >
                      <td className="px-4 py-3 truncate text-sm">
                        {user.prefixName} {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 truncate text-sm">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 truncate text-sm">
                        {user.department?.name || "-"}
                      </td>
                      <td className="px-4 py-3 truncate text-sm">
                        {user.personnelType?.name || "-"}
                      </td>
                      <td className="px-4 py-3 truncate text-sm">
                        {user.phone}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
                          <Link
                            to={`/admin/user/${user.id}`}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-slate-600"
                          >
                            แก้ไข
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
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
                      ไม่พบผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default UserManage;
