import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../utils/api";

function UserLanding() {
  const [users, setUsers] = useState([]); // รายชื่อผู้ใช้งานทั้งหมด
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(apiEndpoints.userLanding);
        setUsers(res.data.user); // กำหนดข้อมูลผู้ใช้
        console.log(res); // ล็อกข้อมูลที่ได้รับจาก API
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading)
    return <div className="text-center mt-8">กำลังโหลดข้อมูล...</div>;

  if (error)
    return (
      <div className="text-center text-red-500 mt-8">ข้อผิดพลาด: {error}</div>
    );

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">รายชื่อบุคลากร</h2>
      {users.length > 0 ? (
        <ul className="space-y-4">
          {users.map((user, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {user.firstName?.charAt(0) || "?"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.prefixName || ""} {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
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
    </div>
  );
}

export default UserLanding;