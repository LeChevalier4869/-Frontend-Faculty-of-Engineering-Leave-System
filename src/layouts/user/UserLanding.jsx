import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

function UserLanding() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(apiEndpoints.userLanding);
        setUsers(res.data.user || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentItems = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatUserInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  if (loading) return <div className="text-center mt-8">กำลังโหลดข้อมูล...</div>;

  if (error)
    return (
      <div className="text-center text-red-500 mt-8">
        ข้อผิดพลาด: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">รายชื่อบุคลากร</h2>

        {currentItems.length > 0 ? (
          <ul className="space-y-4">
            {currentItems.map((user, index) => (
              <li
                key={index}
                className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                    {formatUserInitial(user.firstName)}
                  </div>
                  <div>
                    <p className="font-semibold text-black">
                      {user.prefixName || ""} {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      แผนก: {user.department?.name || "ไม่มีข้อมูล"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">ไม่มีผู้ใช้ในระบบ</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserLanding;
