// src/layouts/user/UserHome.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";

export default function UserHome() {
  // 1) leaveBalance array, loading flag, and error message
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2) Fetch leave balances on mount
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(apiEndpoints.leaveBalance, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ensure we always have an array
        setLeaveBalance(res.data.leaveBalance || []);
      } catch (err) {
        setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลสิทธิ์การลา");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveBalance();
  }, []);

  // 3) Render loading or error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลสิทธิ์การลา…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // 4) Main render
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-10">
          <FaUser className="text-gray-800 text-4xl mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
            ยินดีต้อนรับเข้าสู่ระบบลา
          </h1>
        </div>

        {/* Leave balance table */}
        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">สิทธิการลาของคุณ</h2>
          {leaveBalance.length > 0 ? (
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
                {leaveBalance.map((e, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {e.leavetypes?.name || "-"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {e.maxDays}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {e.usedDays}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {e.remainingDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">คุณยังไม่มีข้อมูลสิทธิ์การลา</p>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/leave/add"
            className="bg-white p-6 rounded-2xl shadow border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">เพิ่มคำขอลา</h3>
            <p className="text-gray-600">ยื่นคำขอลาใหม่</p>
          </Link>

          <Link
            to="/admin/leave-request"
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


