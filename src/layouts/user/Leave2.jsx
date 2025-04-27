import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";

function Leave2() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true); // ✅ เพิ่ม loading

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  useEffect(() => {
    const tryFetch = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // ยังไม่มี token → ลองใหม่ในอีก 500ms
        setTimeout(tryFetch, 500);
        return;
      }
  
      // ถ้ามี token แล้ว → ดึงข้อมูลได้เลย
      const fetchLeaveRequests = async () => {
        try {
          const res = await axios.get(getApiUrl("leave-requests/landing"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLeaveRequest(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
          console.error("Error fetching leave requests:", error);
          setLeaveRequest([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchLeaveRequests();
    };
  
    tryFetch();
  }, [setLeaveRequest]);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaveRequest.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    console.log("TODO: ยกเลิกคำขอลา id:", id);
    // ✅ เพิ่มลบจริงได้ภายหลัง
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลการลา...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit text-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">รายการการลา</h2>

        <div className="bg-gray-50 rounded-2xl shadow p-6 sm:p-8">
          <div className="mb-4 flex justify-end">
            <label className="mr-2">แสดงผลต่อหน้า:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-black"
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base text-black">
              <thead className="bg-gray-100">
                <tr>
                  {["วันที่", "ประเภทการลา", "วันที่เริ่ม", "วันที่สิ้นสุด", "สถานะ", "การดำเนินการ"].map((header, idx) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((leave) => (
                    <tr
                      key={leave.id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/leave/${leave.id}`)}
                    >
                      <td className="border border-gray-300 px-4 py-2">{formatDate(leave.createdAt)}</td>
                      <td className="border border-gray-300 px-4 py-2">{leaveTypes[leave.leaveTypeId] || "ไม่ระบุ"}</td>
                      <td className="border border-gray-300 px-4 py-2">{formatDate(leave.startDate)}</td>
                      <td className="border border-gray-300 px-4 py-2">{formatDate(leave.endDate)}</td>
                      <td className={`border border-gray-300 px-4 py-2 font-bold text-center ${
                        leave.status === "APPROVED"
                          ? "text-green-600"
                          : leave.status === "PENDING"
                          ? "text-yellow-600"
                          : leave.status === "REJECTED"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}>
                        {leave.status}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(leave.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
                        >
                          ยกเลิก
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {leaveRequest.length > 0 &&
              Array.from({ length: Math.ceil(leaveRequest.length / itemsPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leave2;
