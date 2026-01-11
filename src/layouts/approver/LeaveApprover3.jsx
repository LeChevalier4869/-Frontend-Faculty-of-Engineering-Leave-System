import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

dayjs.extend(isBetween);

const PAGE_SIZE = 10;

export default function LeaveApprover3() {
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [comments, setComments] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingApprovals, setLoadingApprovals] = useState({});

  const statusLabels = {
    APPROVED: "อนุมัติแล้ว",
    PENDING: "รออนุมัติ",
    REJECTED: "ปฏิเสธ",
    CANCELLED: "ยกเลิก",
  };
  const statusColors = {
    APPROVED: "bg-green-500 text-white",
    PENDING: "bg-yellow-500 text-white",
    REJECTED: "bg-red-500 text-white",
    CANCELLED: "bg-gray-500 text-white",
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // ดึงข้อมูลจาก proxy API แทนที่เดิด
      const res = await axios.get(apiEndpoints.getApproversForLevel(4, new Date().toISOString().split('T')[0]), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('🔍 Debug - LeaveApprover3 - Proxy API Response:', res.data);
      
      // ตรวจสอบว่า User11 เป็น proxy หรือไม่
      const approvers = res.data.data || [];
      const user11Proxy = approvers.find(a => a.id === 11 && a.isProxy);
      console.log('👤 User11 is proxy for level 4:', user11Proxy);
      
      // ใช้ API endpoint สำหรับ approver (ทำงานเหมือนกันทั้ง proxy และปกติ)
      console.log('🔄 Using approver API endpoint');
      const apiUrl = apiEndpoints.leaveRequestForThirdApprover;
      
      const res2 = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📋 Leave Requests Response:', res2.data);
      
      // ตั้งค่าข้อมูลคำขอลาโดยตรงจาก res2.data (ถ้าเป็น array)
      const data = Array.isArray(res2.data) ? res2.data : [];
      setLeaveRequest(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(apiEndpoints.availableLeaveType);
      const map = {};
      (res.data.data || []).forEach((lt) => {
        map[lt.id] = lt.name;
      });
      setLeaveTypesMap(map);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  const handleApprove = async (detailId) => {
    const commentFromInput = (comments[detailId] || "").trim();
    setLoadingApprovals((prev) => ({ ...prev, [detailId]: true }));
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByThirdApprover(detailId),
        {
          remarks:
            commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
          comment:
            commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      Swal.fire("สำเร็จ", "อนุมัติเรียบร้อยแล้ว", "success");
      setLeaveRequest((prev) =>
        prev.filter((item) => item.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error("❌ Error approving request", error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถอนุมัติได้", "error");
    } finally {
      setLoadingApprovals((prev) => ({ ...prev, [detailId]: false }));
    }
  };

  const handleReject = async (detailId) => {
    const commentFromInput = (comments[detailId] || "").trim();
    setLoadingApprovals((prev) => ({ ...prev, [detailId]: true }));
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.RejectleaveRequestsByThirdApprover(detailId),
        {
          remarks:
            commentFromInput || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
          comment:
            commentFromInput || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      Swal.fire("สำเร็จ", "ปฏิเสธเรียบร้อยแล้ว", "success");
      setLeaveRequest((prev) =>
        prev.filter((item) => item.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error("❌ Error rejecting request", error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถปฏิเสธได้", "error");
    } finally {
      setLoadingApprovals((prev) => ({ ...prev, [detailId]: false }));
    }
  };

  const formatDateTime = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm"); // สำหรับ createdAt
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY"); // สำหรับ startDate และ endDate


  const filtered = useMemo(() => {
    const sorted = [...leaveRequest].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");
      let byDate = true;

      if (filterStartDate && filterEndDate) {
        byDate = dayjs(created).isBetween(
          filterStartDate,
          filterEndDate,
          null,
          "[]"
        );
      } else if (filterStartDate) {
        byDate = created >= filterStartDate;
      } else if (filterEndDate) {
        byDate = created <= filterEndDate;
      }

      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType
        ? String(lr.leaveTypeId) === filterLeaveType
        : true;

      return byDate && byStatus && byType;
    });
  }, [
    leaveRequest,
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterLeaveType,
    sortOrder,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลการลา...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white font-kanit text-black">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">รายการการลาที่รออนุมัติ</h1>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-sm">จาก</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white text-gray-800 font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <label className="text-sm">ถึง</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white text-gray-800 font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Leave-type dropdown */}
        <div className="relative w-48">
          <select
            value={filterLeaveType}
            onChange={(e) => {
              setFilterLeaveType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none bg-white text-gray-800 font-medium px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">ประเภทการลาทั้งหมด</option>
            {Object.entries(leaveTypesMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Sort order dropdown */}
        <div className="relative w-48">
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none bg-white text-gray-800 font-medium px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="desc">ล่าสุดก่อน</option>
            <option value="asc">เก่าสุดก่อน</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Clear filters */}
        <button
          onClick={() => {
            setFilterStartDate("");
            setFilterEndDate("");
            setFilterStatus("");
            setFilterLeaveType("");
            setSortOrder("desc");
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          ล้าง
        </button>
      </div>

      {/* table */}
      <div className="rounded-lg shadow border border-gray-300 overflow-x-auto">
        <table className="min-w-full bg-white text-sm text-black">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              {[
                "วันที่ยื่น",
                "ชื่อผู้ลา",
                "ประเภทการลา",
                "วันเริ่มต้น",
                "วันสิ้นสุด",
                "สถานะ",
                "ความคิดเห็น",
                "ดำเนินการ",
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left whitespace-nowrap ${h === "ชื่อผู้ลา" ? "w-[220px]" : ""
                    }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayItems.length > 0 ? (
              displayItems.map((leave, idx) => {
                const detailId = leave.leaveRequestDetails?.[0]?.id;
                const statusKey = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-2">
                      {formatDateTime(leave.createdAt)}
                    </td>
                    <td className="px-4 py-2 w-[220px]">
                      {leave.user.prefixName}
                      {leave.user.firstName} {leave.user.lastName}
                    </td>
                    <td className="px-4 py-2">
                      {leaveTypesMap[leave.leaveTypeId] || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="px-4 py-2">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`px-4 py-1 whitespace-nowrap rounded-full text-xs font-semibold ${statusColors[statusKey] || "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {statusLabels[statusKey] || leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={comments[detailId] || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setComments((c) => ({
                              ...c,
                              [detailId]: e.target.value,
                            }))
                          }
                          className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                          placeholder="ใส่ความคิดเห็น"
                        />
                        <Pencil
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row justify-center gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            handleApprove(detailId);
                          }}
                          disabled={loadingApprovals[detailId]}
                          className={`px-4 py-1 rounded text-white transition ${loadingApprovals[detailId]
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                          {loadingApprovals[detailId] ? "กำลังดำเนินการ" : "ตกลง"}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            handleReject(detailId);
                          }}
                          disabled={loadingApprovals[detailId]}
                          className={`px-4 py-1 rounded text-white transition ${loadingApprovals[detailId]
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                            }`}
                        >
                          {loadingApprovals[detailId] ? "กำลังดำเนินการ" : "ปฏิเสธ"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-50 transition"
          >
            ก่อนหน้า
          </button>
          <span className="px-3 py-1 text-gray-800">
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-50 transition"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
