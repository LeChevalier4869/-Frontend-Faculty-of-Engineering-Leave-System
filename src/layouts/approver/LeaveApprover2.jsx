import React, { useEffect, useState } from "react";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";

function LeaveApprover2() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };
  const handleApprove = async (leaveRequestId) => {
    const { value: formValues } = await Swal.fire({
      title: "อนุมัติคำขอ",
      html:
        `<label for="remarks">เหตุผล:</label>` +
        `<textarea id="remarks" class="swal2-textarea" placeholder="ระบุเหตุผลการอนุมัติ"></textarea><br/>` +
        `<label for="comment">ความคิดเห็น:</label>` +
        `<textarea id="comment" class="swal2-textarea" placeholder="ความคิดเห็นเพิ่มเติม"></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const remarks = document.getElementById("remarks").value.trim();
        const comment = document.getElementById("comment").value.trim();
        if (!remarks || !comment) {
          Swal.showValidationMessage("กรุณากรอกเหตุผลและความคิดเห็นให้ครบถ้วน");
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบก่อน",
            confirmButtonColor: "#ef4444",
          });
          return;
        }
        return { remarks, comment };
      },
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบก่อน",
            confirmButtonColor: "#ef4444",
          });
          return;
        }
        await axios.patch(
          apiEndpoints.ApproveleaveRequestsBySecondApprover(leaveRequestId),
          formValues,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        Swal.fire("สำเร็จ", "อนุมัติคำขอเรียบร้อยแล้ว", "success");
      } catch (error) {
        const message =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการอนุมัติ";
        Swal.fire("ผิดพลาด", message, "error");
      }
    }
  };

  const handleReject = async (leaveRequestId) => {
    const { value: reason } = await Swal.fire({
      title: "ปฏิเสธคำขอ",
      input: "textarea",
      inputLabel: "เหตุผลในการปฏิเสธ",
      inputPlaceholder: "กรุณาระบุเหตุผล...",
      inputAttributes: {
        "aria-label": "กรุณาระบุเหตุผลในการปฏิเสธคำขอ",
      },
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("กรุณาระบุเหตุผลในการปฏิเสธคำขอ");
        }
        return value;
      },
    });

    if (reason) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          apiEndpoints.RejectleaveRequestsBySecondApprover(leaveRequestId),
          { reason },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire("สำเร็จ", "ปฏิเสธคำขอเรียบร้อยแล้ว", "success");
        setLeaveRequests((prev) =>
          prev.filter((request) => request.id !== leaveRequestId)
        );
      } catch (error) {
        const message =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการปฏิเสธคำขอ";
        Swal.fire("ผิดพลาด", message, "error");
      }
    }
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiEndpoints.leaveRequestForSecondApprover,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("📥 ดึงข้อมูลทั้งหมดสำเร็จ", res.data);
        setLeaveRequests(res.data || []);
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
      <h1 className="text-2xl font-bold mb-6 text-center">คำขอลาทั้งหมด</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="px-4 py-2 border border-gray-200">ชื่อผู้ลา</th>
              <th className="px-4 py-2 border border-gray-200">ประเภทการลา</th>
              <th className="px-4 py-2 border border-gray-200">วันที่เริ่ม</th>
              <th className="px-4 py-2 border border-gray-200">
                วันที่สิ้นสุด
              </th>
              <th className="px-4 py-2 border border-gray-200">สถานะ</th>
              <th className="px-4 py-2 border border-gray-200">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  // onClick={() => navigate(`/leave/${item.id}`)}
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
                  <td className="px-6 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.leaveRequestDetails?.[0]?.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      อนุมัติ
                    </button>
                    <button
                      onClick={() => handleReject(item.leaveRequestDetails?.[0]?.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ปฏิเสธ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
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

export default LeaveApprover2;
