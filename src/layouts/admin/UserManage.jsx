// src/pages/admin/UserManage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 200;

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  /* ---------- debounce search ---------- */
  useEffect(() => {
    const id = setTimeout(
      () => setKeyword(searchInput.trim().toLowerCase()),
      DEBOUNCE_MS
    );
    return () => clearTimeout(id);
  }, [searchInput]);

  /* ---------- helpers ---------- */
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

  /* ---------- data fetching ---------- */
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

  /* ---------- CRUD ---------- */
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

  /* ---------- filter + pagination ---------- */
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

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-center md:text-left flex-1">
            จัดการผู้ใช้งาน
          </h1>

          {/* 🔍 Search box */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาชื่อ..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64
                       bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <Link
            to="/admin/add-user"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition whitespace-nowrap"
          >
            + เพิ่มผู้ใช้งาน
          </Link>
        </div>

        {/* table */}
        <div className="rounded-lg shadow border border-gray-300 overflow-hidden">
          <table className="table-fixed w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-3 text-left w-[18%]">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left w-[22%]">อีเมล</th>
                <th className="px-4 py-3 text-left w-[15%]">แผนก</th>
                <th className="px-4 py-3 text-left w-[15%]">ประเภทบุคลากร</th>
                <th className="px-4 py-3 text-left w-[12%]">เบอร์โทร</th>
                {/* <th className="px-4 py-3 text-left w-[11%]">บทบาท</th> */}
                <th className="px-4 py-3 text-center w-[15%]">การจัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : displayedUsers.length ? (
                displayedUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/admin/user-info/${user.id}`)}
                    className={`cursor-pointer ${
                      idx % 2 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-50 transition`}
                  >
                    <td className="px-4 py-3 truncate">
                      {user.prefixName} {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 truncate">{user.email}</td>
                    {/* <td className="px-4 py-3 truncate">
                      {Array.isArray(user.roles)
                      ? user.roles.map((r) => r.name).join(", ")
                      : user.role || "USER"}
                      </td> */}
                    <td className="px-4 py-3 truncate">
                      {user.department?.name || "-"}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {user.personnelType?.name || "-"}
                    </td>
                      <td className="px-4 py-3 truncate">{user.phone}</td>
                    <td
                      className="px-4 py-3 text-center space-x-2"
                      onClick={(e) => e.stopPropagation()} // 👈 ป้องกันเด้งเมื่อกดปุ่มในแถว
                    >
                      <Link
                        to={`/admin/user/${user.id}`}
                        className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-block bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    ไม่พบผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
