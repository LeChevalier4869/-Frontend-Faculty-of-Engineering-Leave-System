// src/pages/admin/UserManage.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import { FiUser, FiUsers } from "react-icons/fi";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 200;

const MySwal = withReactContent(Swal);

const ROLE_PRIORITY = [
  "SUPER_ADMIN", "ADMIN", "APPROVER_4", "APPROVER_3",
  "APPROVER_2", "APPROVER_1", "VERIFIER", "USER",
];
const ROLE_COLOR = {
  SUPER_ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVER_4: "bg-violet-50 text-violet-700 border-violet-200",
  APPROVER_3: "bg-violet-50 text-violet-700 border-violet-200",
  APPROVER_2: "bg-violet-50 text-violet-700 border-violet-200",
  APPROVER_1: "bg-violet-50 text-violet-700 border-violet-200",
  VERIFIER: "bg-teal-50 text-teal-700 border-teal-200",
  USER: "bg-slate-50 text-slate-600 border-slate-200",
};

const getHighestRole = (roleNames) => {
  if (!roleNames.length) return null;
  for (const r of ROLE_PRIORITY) {
    if (roleNames.includes(r)) return r;
  }
  return roleNames[0];
};

/* eslint-disable react/prop-types */
const RoleBadgeCell = ({ userRoles }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef(null);

  const roleNames = (userRoles || [])
    .map((ur) => ur.role?.name || ur.roleName)
    .filter(Boolean);
  const display = roleNames.length > 1
    ? roleNames.filter((r) => r !== "USER")
    : roleNames;

  const highest = getHighestRole(display);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!highest) return <span className="text-slate-400">-</span>;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="group inline-flex items-center gap-1"
      >
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_COLOR[highest] || "bg-sky-50 text-sky-700 border-sky-200"}`}
        >
          {highest}
        </span>
        {display.length > 1 && (
          <span className="text-[10px] text-slate-400 group-hover:text-sky-500 transition">
            +{display.length - 1}
          </span>
        )}
      </button>

      {open && display.length > 1 && ReactDOM.createPortal(
        <div
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="min-w-[140px] rounded-xl bg-white border border-slate-200 shadow-lg p-2 flex flex-col gap-1"
        >
          {display.map((r) => (
            <span
              key={r}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border w-fit ${ROLE_COLOR[r] || "bg-sky-50 text-sky-700 border-sky-200"}`}
            >
              {r}
            </span>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

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
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[15%]">
                    ประเภทบุคลากร
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[15%]">
                    บทบาท
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold w-[10%]">
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
                      colSpan={7}
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
                      <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <RoleBadgeCell userRoles={user.userRoles} />
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
                      colSpan={7}
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
          <div className="flex items-center justify-between mt-6 bg-white rounded-lg px-4 py-3 border border-slate-200">
            <div className="text-sm text-slate-700">
              แสดง {(currentPage - 1) * PAGE_SIZE + 1} ถึง {Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              {(() => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage <= 4) {
                    pages.push(2, 3, 4, 5, '...', totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }
                return pages.map((page, idx) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page ? 'z-10 bg-sky-50 border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManage;
