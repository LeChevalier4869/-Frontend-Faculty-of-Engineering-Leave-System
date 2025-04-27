import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react"; // ไอคอนดินสอ
import getApiUrl from "../../utils/apiUtils";
import { apiEndpoints } from "../../utils/api";

function LeaveApprover1() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  const statusLabels = {
    PENDING: "รออนุมัติ",
    APPROVED: "อนุมัติแล้ว",
    REJECTED: "ปฏิเสธ",
    CANCELLED: "ยกเลิก",
  };

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(apiEndpoints.leaveRequestForFirstApprover, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data || []);
    } catch (error) {
      console.error("❌ Error loading leave requests", error);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleEditComment = async (itemId) => {
    const leave = leaveRequests.find((item) => item.id === itemId);

    const result = await Swal.fire({
      title: "แก้ไขความคิดเห็น",
      input: "textarea",
      inputValue: leave?.comment || "",
      inputPlaceholder: "กรอกความคิดเห็นของคุณ...",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const updatedRequests = leaveRequests.map((item) =>
        item.id === itemId ? { ...item, comment: result.value } : item
      );
      setLeaveRequests(updatedRequests);
    }
  };

  const handleApprove = async (leaveRequestDetailId, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByFirstApprover(leaveRequestDetailId),
        { remarks: comment || "อนุมัติ", comment: comment || "อนุมัติ" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchLeaveRequests();
      Swal.fire("สำเร็จ", "อนุมัติคำขอเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("❌ Error approving request", error);
    }
  };

  const handleReject = async (leaveRequestDetailId, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.RejectleaveRequestsByFirstApprover(leaveRequestDetailId),
        { reason: comment || "ไม่อนุมัติ", comment: comment || "ไม่อนุมัติ" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchLeaveRequests();
      Swal.fire("สำเร็จ", "ปฏิเสธคำขอเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("❌ Error rejecting request", error);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaveRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);

  return (
    <div className="p-6 bg-white min-h-screen text-black font-kanit">
      <h1 className="text-2xl font-bold mb-6 text-center">คำขอลาทั้งหมด</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="px-4 py-2 border border-gray-200">ชื่อผู้ลา</th>
              <th className="px-4 py-2 border border-gray-200">ประเภทการลา</th>
              <th className="px-4 py-2 border border-gray-200">วันที่เริ่ม</th>
              <th className="px-4 py-2 border border-gray-200">วันที่สิ้นสุด</th>
              <th className="px-4 py-2 border border-gray-200">สถานะ</th>
              <th className="px-4 py-2 border border-gray-200">ความคิดเห็น</th>
              <th className="px-4 py-2 border border-gray-200 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                const statusKey = (item.status || "").toUpperCase();
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200">
                      {item.user?.prefixName} {item.user?.firstName} {item.user?.lastName}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {leaveTypes[item.leaveTypeId] || "ไม่ระบุ"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">{formatDate(item.startDate)}</td>
                    <td className="px-4 py-2 border border-gray-200">{formatDate(item.endDate)}</td>
                    <td className="px-4 py-2 border border-gray-200 text-center font-semibold">
                      {statusLabels[statusKey] || item.status || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{item.comment || "-"}</span>
                        <button onClick={() => handleEditComment(item.id)}>
                          <Pencil size={16} className="text-blue-500 hover:text-blue-700" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center space-x-2">
                      <button
                        onClick={() => handleApprove(item.leaveRequestDetails?.[0]?.id, item.comment)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleReject(item.leaveRequestDetails?.[0]?.id, item.comment)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                      >
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
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
          <span>
            หน้า {currentPage} / {totalPages}
          </span>
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

export default LeaveApprover1;
