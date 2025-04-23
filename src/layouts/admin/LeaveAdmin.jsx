import React, { useEffect, useState } from "react";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import { useNavigate } from "react-router-dom";

function LeaveAdmin() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(getApiUrl("leave-requests"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📥 ดึงข้อมูลทั้งหมดสำเร็จ", res.data);
        setLeaveRequests(res.data.data || []);
      } catch (error) {
        console.error("❌ Error loading leave requests", error);
      }
    };

    fetchLeaveRequests();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaveRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);

  return (
    <div className="p-6 bg-white min-h-screen text-black font-kanit">
      <h1 className="text-2xl font-bold mb-6 text-center">คำขอลาทั้งหมด (Admin)</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="px-4 py-2 border border-gray-200">ชื่อผู้ลา</th>
              <th className="px-4 py-2 border border-gray-200">ประเภทการลา</th>
              <th className="px-4 py-2 border border-gray-200">วันที่เริ่ม</th>
              <th className="px-4 py-2 border border-gray-200">วันที่สิ้นสุด</th>
              <th className="px-4 py-2 border border-gray-200">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/leave/${item.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 border border-gray-200">
                    {item.user?.prefixName} {item.user?.firstName}{" "}
                    {item.user?.lastName}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {leaveTypes[item.leaveTypeId] || "ไม่ระบุ"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {formatDate(item.startDate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {formatDate(item.endDate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center font-semibold">
                    {item.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  ไม่มีข้อมูลคำขอ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <span>หน้า {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}

export default LeaveAdmin;
