import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

function LeaveBalance() {
  const [entitlements, setEntitlements] = useState([
    // { type: "ลาป่วย", total: 30, used: 5 },
    // { type: "ลากิจ", total: 10, used: 3 },
    // { type: "ลาพักร้อน", total: 15, used: 7 },
    // { type: "ลาคลอด", total: 90, used: 90 },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        const res = await axios.get(apiEndpoints.getLeaveBalanceForMe, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // ตรวจสอบว่า res.data เป็น array จริง ๆ
        if (Array.isArray(res.data.data)) {
          setEntitlements(res.data.data);
        } else {
          console.warn("Leave balance response is not an array:", res.data);
          setEntitlements([]); // fallback
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลสิทธิลาการลาได้",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  if (isLoading) {
    return <p className="text-center">กำลังโหลดข้อมูล...</p>;
  }

  if (entitlements.length === 0) {
    return <p className="text-center">ไม่มีข้อมูลสิทธิลาการลา</p>;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-semibold text-center">สิทธิลาการลา</h1>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  ประเภทการลา
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  จำนวนวันทั้งหมด
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  วันที่ใช้ไป
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  วันที่กำลังดำเนินการ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  วันที่เหลือ
                </th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((entitlement, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {entitlement.leaveType.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {entitlement.maxDays}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {entitlement.usedDays}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {entitlement.pendingDays}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {entitlement.remainingDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default LeaveBalance;
