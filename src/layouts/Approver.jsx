import React, { useState, useEffect } from "react";
import { apiEndpoints } from "../utils/api";
import axios from "axios";
import { Link } from "react-router-dom";

function Approver() {
  const [pendingRequest, setPendingRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequest(res.data.leaveRequest);
        console.log(res.data.leaveRequest);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequest();
  }, []);

  const handleApprove = async (id) => {
    const confirmApprove = window.confirm("คุณต้องการอนุมัติการลานี้หรือไม่?");
    if (confirmApprove) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8000/leave-requests/${id}/approve`,
          {}, // ส่งข้อมูลว่างสำหรับ `POST` ถ้า API ต้องการ
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // อัปเดตสถานะหลังจากอนุมัติสำเร็จ
        setPendingRequest((prev) =>
          prev.filter((leave) => leave.id !== id)
        );
        alert("อนุมัติสำเร็จ!");
      } catch (err) {
        console.error("Failed to approve:", err.message);
        alert("เกิดข้อผิดพลาดในการอนุมัติ");
      }
    }
  };

  const handleReject = async (id) => {
    const confirmReject = window.confirm("คุณต้องการปฏิเสธการลานี้หรือไม่?");
    if (confirmReject) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8000/leave-requests/${id}/reject`,
          {}, // ส่งข้อมูลว่างสำหรับ `POST` ถ้า API ต้องการ
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // อัปเดตสถานะหลังจากอนุมัติสำเร็จ
        setPendingRequest((prev) =>
          prev.filter((leave) => leave.id !== id)
        );
        alert("ปฏิเสธสำเร็จ!");
      } catch (err) {
        console.error("Failed to reject:", err.message);
        alert("เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  if (error)
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      {/* Header */}
      <h2 className="text-3xl font-bold text-center mb-6">
      การลาที่รอการอนุมัติ
      </h2>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                ประเภทการลา
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                วันที่เริ่ม
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                วันที่สิ้นสุด
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                เหตุผล
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                สถานะ
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pendingRequest) && pendingRequest.length > 0 ? (
              // จัดเรียงตามวันที่เริ่มต้น (startDate)
              [...pendingRequest]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // ใช้ Date เพื่อจัดเรียง
                .map((leave, index) => (
                  <tr key={leave.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {leave.leaveType.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {leave.reason}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {leave.status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded mr-2"
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="btn bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        อนุมัติ
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                >
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Approver;
