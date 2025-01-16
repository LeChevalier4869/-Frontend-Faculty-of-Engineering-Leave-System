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
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.getUserLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.user);
        console.log(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  if (error)
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">
        รายชื่อบุคลากร
      </h2>
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition duration-200"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">
                {user.prefixName || "ไม่มีข้อมูล"}{" "}
                {user.firstName || "ไม่มีข้อมูล"}{" "}
                {user.lastName || "ไม่มีข้อมูล"}
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">แผนก:</span>{" "}
                {user.department?.name || "ไม่มีข้อมูล"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">ตำแหน่ง:</span>{" "}
                {user.position || "ไม่มีข้อมูล"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">ไม่มีผู้ใช้ในระบบ</p>
      )}
    </div>
  );
}

export default UserLanding;
