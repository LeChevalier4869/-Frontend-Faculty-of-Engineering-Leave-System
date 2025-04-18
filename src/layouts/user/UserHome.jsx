import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";

function UserHome() {
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveBalance, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveBalance(res.data.leaveBalance);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveBalance();
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-10">
          <FaUser className="text-gray-800 text-4xl mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
            ยินดีต้อนรับเข้าสู่ระบบลา
          </h1>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">สิทธิการลาของคุณ</h2>

          <table className="min-w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border border-gray-200 px-4 py-2 text-left">ประเภทการลา</th>
                <th className="border border-gray-200 px-4 py-2 text-right">จำนวนวันลาทั้งหมด</th>
                <th className="border border-gray-200 px-4 py-2 text-right">วันลาที่ใช้ไป</th>
                <th className="border border-gray-200 px-4 py-2 text-right">วันลาคงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {leaveBalance.map((e, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{e.leavetypes.name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{e.maxDays}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{e.usedDays}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{e.remainingDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/leave/add"
            className="bg-white p-6 rounded-2xl shadow border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">เพิ่มคำขอลา</h3>
            <p className="text-gray-600">ยื่นคำขอลาใหม่</p>
          </Link>

          <Link
            to="/leave"
            className="bg-white p-6 rounded-2xl shadow border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">จัดการคำขอลา</h3>
            <p className="text-gray-600">ดูและจัดการคำขอลาทั้งหมด</p>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-2xl shadow border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">โปรไฟล์ผู้ใช้</h3>
            <p className="text-gray-600">ดูและแก้ไขข้อมูลผู้ใช้</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
