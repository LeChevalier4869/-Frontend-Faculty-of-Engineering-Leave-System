import React, { useState } from "react";

function LeaveBalance() {
  const [entitlements, setEntitlements] = useState([
    { type: "ลาป่วย", total: 30, used: 5 },
    { type: "ลากิจ", total: 10, used: 3 },
    { type: "ลาพักร้อน", total: 15, used: 7 },
    { type: "ลาคลอด", total: 90, used: 90 },
  ]);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">สิทธิลาการลา</h1>

      <div className="overflow-x-auto">
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
                วันที่เหลือ
              </th>
            </tr>
          </thead>
          <tbody>
            {entitlements.map((entitlement, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">
                  {entitlement.type}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {entitlement.total}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {entitlement.used}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {entitlement.total - entitlement.used}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveBalance;
