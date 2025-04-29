import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

const PAGE_SIZE = 8;

export default function UserManage() {
  const [users, setUsers] = useState([]);
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

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const displayedUsers = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <h1 className="flex-1 text-3xl font-bold text-center">จัดการผู้ใช้งาน</h1>
          <Link
            to="/admin/add-user"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            + เพิ่มผู้ใช้งาน
          </Link>
        </div>

        <div className="rounded-lg shadow border border-gray-300 overflow-hidden">
          <table className="table-fixed w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-4 py-3 text-left w-[18%]">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left w-[22%]">อีเมล</th>
                <th className="px-4 py-3 text-left w-[15%]">เบอร์โทร</th>
                <th className="px-4 py-3 text-left w-[15%]">ประเภทบุคลากร</th>
                <th className="px-4 py-3 text-left w-[15%]">แผนก</th>
                <th className="px-4 py-3 text-center w-[15%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : displayedUsers.length > 0 ? (
                displayedUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`${idx % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3 truncate">
                      {user.prefixName} {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 truncate">{user.email}</td>
                    <td className="px-4 py-3 truncate">{user.phone}</td>
                    <td className="px-4 py-3 truncate">{user.personnelType?.name || "-"}</td>
                    <td className="px-4 py-3 truncate">{user.department?.name || "-"}</td>
                    <td className="px-4 py-3 text-center space-x-2">
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
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    ยังไม่มีข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
