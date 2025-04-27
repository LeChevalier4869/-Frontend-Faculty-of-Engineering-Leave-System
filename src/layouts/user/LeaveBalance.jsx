import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

function LeaveBalance() {
  const [entitlements, setEntitlements] = useState([]);
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

        if (Array.isArray(res.data.data)) {
          setEntitlements(res.data.data);
        } else {
          console.warn("Leave balance response is not an array:", res.data);
          setEntitlements([]);
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
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลสิทธิลาการลา...
      </div>
    );
  }

  if (entitlements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-400">
        ไม่มีข้อมูลสิทธิลาการลา
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      <div className="max-w-7xl mx-auto bg-white text-black rounded-2xl shadow p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-center">สิทธิลาการลา</h1>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold whitespace-nowrap">ประเภทการลา</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap">จำนวนวันทั้งหมด</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap">วันที่ใช้ไป</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap">วันที่กำลังดำเนินการ</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap">วันที่เหลือ</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((entitlement, index) => (
                <tr key={index} className="border-t hover:bg-gray-100">
                  <td className="p-3">{entitlement.leaveType?.name || "-"}</td>
                  <td className="p-3 text-right">{entitlement.maxDays ?? "-"}</td>
                  <td className="p-3 text-right">{entitlement.usedDays ?? "-"}</td>
                  <td className="p-3 text-right">{entitlement.pendingDays ?? "-"}</td>
                  <td className="p-3 text-right">{entitlement.remainingDays ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaveBalance;
