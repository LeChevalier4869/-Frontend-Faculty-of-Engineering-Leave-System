import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../utils/api";

function UserLanding() {
  const [users, setUsers] = useState([]); // รายชื่อผู้ใช้งานทั้งหมด
  const [filteredUsers, setFilteredUsers] = useState([]); // รายชื่อผู้ใช้งานที่กรองแล้ว
  const [searchTerm, setSearchTerm] = useState(""); // คำค้นหา
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.getUserLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
        setFilteredUsers(res.data.users); // ตั้งค่าข้อมูลเริ่มต้นให้เหมือนกัน
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(term) // กรองรายชื่อจากคำค้นหา
      )
    );
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  if (error)
    return (
      <div className="text-center text-red-500 mt-8">
        Error: {error}
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        รายชื่อคุลกร
      </h2>
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="ค้นหารายชื่อ..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-md px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      {filteredUsers.length > 0 ? (
        <ul className="space-y-4">
          {filteredUsers.map((user, index) => (
            <li
              key={index}
              className="bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-xl transition duration-200"
            >
              <h3 className="text-lg font-semibold text-blue-600">
                {user.name || "No Name"}
              </h3>
              <p className="text-gray-700">{user.email || "No Email"}</p>
              <p className="text-gray-500 text-sm">{user.role || "No Role"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          ไม่พบข้อมูลผู้ใช้งานที่ตรงกับคำค้นหา
        </p>
      )}
    </div>
  );
}

export default UserLanding;
