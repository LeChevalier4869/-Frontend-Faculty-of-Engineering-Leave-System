import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../utils/api";
import { Link } from "react-router-dom";

function UserHome() {
  // const [es, setes] = useState([
  //   { type: "ลาป่วย", total: 30, used: 5 },
  //   { type: "ลากิจ", total: 10, used: 3 },
  //   { type: "ลาพักร้อน", total: 15, used: 7 },
  //   { type: "ลาคลอด", total: 90, used: 90 },
  // ]);

  const [leaveBalance, setLeaveBalance] = useState([]); // รายชื่อผู้ใช้งานทั้งหมด
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
        console.log(res.data.leaveBalance);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveBalance();
  }, []);

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">หน้าหลัก</h2>
      <div className="max-w-5xl mx-auto mt-6 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  ประเภทการลา
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  จำนวนวันลาทั้งหมด
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  วันลาที่ใช้ไป
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  วันลาคงเหลือ
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveBalance.map((e, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {e.leaveType.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {e.totalDays}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {e.usedDays}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {e.totalDays - e.usedDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="max-w-5xl mx-auto  pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/leave/add"
                className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
              >
                <h2 className="text-xl font-bold mb-2">เพิ่มคำขอลา</h2>
                <p>ยื่นคำขอลาใหม่</p>
              </Link>
              <Link
                to="/leave"
                className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
              >
                <h2 className="text-xl font-bold mb-2">จัดการคำขอลา</h2>
                <p>ดูและจัดการคำขอลาทั้งหมด</p>
              </Link>
              <Link
                to="/profile"
                className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
              >
                <h2 className="text-xl font-bold mb-2">โปรไฟล์ผู้ใช้</h2>
                <p>ดูและแก้ไขข้อมูลผู้ใช้</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
