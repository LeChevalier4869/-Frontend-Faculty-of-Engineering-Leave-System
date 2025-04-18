import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";

function Approver() {
  const [pendingRequest, setPendingRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage, setItemsPerPage] = useState(5); 

  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequest(res.data.leaveRequest);
      } catch (err) {
        setError(
          err.response?.data?.message || "Error fetching leave requests"
        );
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
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
        alert("อนุมัติสำเร็จ!");
      } catch (err) {
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
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
        alert("ปฏิเสธสำเร็จ!");
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

 // คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentItems = pendingRequest.slice(indexOfFirstItem, indexOfLastItem);

 // เปลี่ยนหน้า
 const paginate = (pageNumber) => setCurrentPage(pageNumber);

 // เปลี่ยนจำนวนรายการต่อหน้า
 const handleItemsPerPageChange = (e) => {
   setItemsPerPage(Number(e.target.value));
   setCurrentPage(1); // รีเซ็ตกลับไปหน้าที่ 1 เมื่อเปลี่ยนจำนวนรายการต่อหน้า
 };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">
        การลาที่รอการอนุมัติ
      </h2>
      {/* Dropdown เพื่อเลือกจำนวนรายการต่อหน้า */}
      <div className="mb-4 flex justify-end">
        <label className="mr-2">แสดงผลต่อหน้า:</label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                วันที่
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                ชื่อผู้ยื่นลา
              </th>
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
                สถานะ
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(currentItems) && currentItems.length > 0 ? (
              currentItems.map((leave) => (
                <tr
                  key={leave.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/leave/${leave.id}`)}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(leave.createdAt)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leave.users.prefixName}
                    {leave.users.firstName} {leave.users.lastName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {leaveTypes[leave.leaveTypeId] || "ไม่ระบุ"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(leave.startDate)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(leave.endDate)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`font-bold ${
                        leave.status === "APPROVED"
                          ? "text-green-500"
                          : leave.status === "PENDING"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(leave.id);
                      }}
                      className="btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded mr-2"
                    >
                      ปฏิเสธ
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(leave.id);
                      }}
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

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        {Array.from(
          { length: Math.ceil(pendingRequest.length / itemsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Approver;