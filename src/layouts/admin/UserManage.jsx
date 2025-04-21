import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

function UserManage() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔗 userLanding endpoint:", apiEndpoints.userLanding);
        const res = await axios.get(apiEndpoints.userLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ res.data:", res.data);

        let fetchedUsers = res.data?.user || [];
        if (!Array.isArray(fetchedUsers)) {
          console.warn("⚠️ Fetched users is not an array:", fetchedUsers);
          fetchedUsers = [];
        }
        console.log("✅ ข้อมูลผู้ใช้งาน:", fetchedUsers);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("❌ โหลดผู้ใช้งานล้มเหลว:", err);
        console.error("🔍 รายละเอียดเพิ่มเติม:", err.response || err.message || err);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้", "error");
      }      
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });
  
    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(apiEndpoints.deleteUserByAdmin(userId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        Swal.fire("ลบสำเร็จ", "ข้อมูลผู้ใช้งานถูกลบแล้ว", "success");
      } catch (err) {
        console.error("❌ ลบผู้ใช้ไม่สำเร็จ:", err);
        Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถลบผู้ใช้งานได้", "error");
      }
    }
  };  

  const totalPages = users.length ? Math.ceil(users.length / usersPerPage) : 1;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = Array.isArray(users)
    ? users.slice(indexOfFirstUser, indexOfLastUser)
    : [];

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            จัดการผู้ใช้งาน
          </h1>
          <Link
            to="/admin/add-user"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
          >
            + เพิ่มผู้ใช้งาน
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
            <thead className="bg-gray-100 font-semibold text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left">อีเมล</th>
                <th className="px-6 py-3 text-left">เบอร์โทร</th>
                <th className="px-6 py-3 text-left">ประเภทบุคลากร</th>
                <th className="px-6 py-3 text-left">คณะ</th>
                <th className="px-6 py-3 text-left">แผนก</th>
                <th className="px-6 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      {user.prefixName}
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.phone}</td>
                    <td className="px-6 py-3">{user.personnelType?.name || "-"}</td>
                    <td className="px-6 py-3">{user.organization?.name || "-"}</td>
                    <td className="px-6 py-3">{user.department?.name || "-"}</td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <Link
                        to={`/admin/user/${user.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    ยังไม่มีข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManage;
