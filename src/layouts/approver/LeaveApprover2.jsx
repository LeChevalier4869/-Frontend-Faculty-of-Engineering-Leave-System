import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown } from "lucide-react";
import { apiEndpoints } from "../../utils/api";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";

dayjs.extend(isBetween);

const MAX_LENGTH = 15;
const PAGE_SIZE = 10;

export default function LeaveApprover2() {
  const navigate = useNavigate();
  //   const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

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
      const token = localStorage.getItem("token");
      const res = await axios.get(apiEndpoints.leaveRequestForFirstApprover, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Leave Requests:", res.data);

      // ตั้งค่าข้อมูลคำขอลาโดยตรงจาก res.data (ถ้าเป็น array)
      const data = Array.isArray(res.data) ? res.data : [];
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

  // Edit the comment locally
  const handleEditComment = async (itemId) => {
    const leave = leaveRequest.find((item) => item.id === itemId);
    const { value } = await Swal.fire({
      title: "แก้ไขความคิดเห็น",
      input: "textarea",
      inputValue: leave?.comment || "",
      inputPlaceholder: "กรอกความคิดเห็นของคุณ...",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });
    if (value !== undefined) {
      setLeaveRequest((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, comment: value } : item
        )
      );
    }
  };

  // Approve and remove from list
  const handleApprove = async (detailId, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByFirstApprover(detailId),
        { remarks: comment || "อนุมัติ", comment: comment || "อนุมัติ" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("สำเร็จ", "อนุมัติเรียบร้อยแล้ว", "success");
      setLeaveRequest((prev) =>
        prev.filter((item) => item.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error("❌ Error approving request", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถอนุมัติได้", "error");
    }
  };

  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

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
    sortOrder, // 👈 อย่าลืมเพิ่ม dependency
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
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-7xl mx-auto">
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
              className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="text-sm">ถึง</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">ประเภทการลาทั้งหมด</option>
              {Object.entries(leaveTypesMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="w-4 h-4 text-gray-500" />
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
              className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="desc">ล่าสุดก่อน</option>
              <option value="asc">เก่าสุดก่อน</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          {/* Clear filters */}
          <button
            onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
              setFilterStatus("");
              setFilterLeaveType("");
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            ล้าง
          </button>
        </div>

        {/* legend */}
        {/* <div className="flex gap-6 items-center text-sm mb-6">
          {Object.entries(statusLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[key]}`} />
              <span className="text-gray-800">{label}</span>
            </div>
          ))}
        </div> */}

        {/* table */}
        <div className="rounded-lg shadow border border-gray-300 overflow-hidden">
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
                    className={`px-4 py-3 text-left ${
                      h === "ชื่อผู้ลา" ? "w-[220px]" : ""
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
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition cursor-pointer`}
                      onClick={() => navigate(`/leave/${leave.id}`)}
                    >
                      <td className="px-4 py-2">
                        {formatDate(leave.createdAt)}
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
                      <td className="px-4 py-2">{formatDate(leave.endDate)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-semibold ${
                            statusColors[statusKey] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabels[statusKey] || leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 max-w-xs truncate">
                        <div className="inline-flex items-center gap-2">
                          {/* ตัดข้อความเฉพาะ span นี้ */}
                          <span
                            title={leave.comment}
                            className="truncate max-w-[150px] block"
                          >
                            {leave.comment?.length > MAX_LENGTH
                              ? `${leave.comment.slice(0, MAX_LENGTH)}`
                              : leave.comment || "-"}
                          </span>

                          {/* ปุ่ม "ดูเพิ่มเติม" ถ้ายาวเกิน */}
                          {leave.comment?.length > MAX_LENGTH && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                Swal.fire({
                                  title: "ความคิดเห็นทั้งหมด",
                                  text: leave.comment,
                                  confirmButtonText: "ปิด",
                                });
                              }}
                              className="text-blue-500 hover:underline text-xs whitespace-nowrap"
                            >
                              ดูเพิ่มเติม
                            </button>
                          )}

                          {/* ปุ่มแก้ไข */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditComment(leave.id);
                            }}
                          >
                            <Pencil
                              size={16}
                              className="text-blue-500 hover:text-blue-700"
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(detailId, leave.comment);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                        >
                          ตกลง
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
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
    </div>
  );
}
