import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

dayjs.extend(isBetween);

const PAGE_SIZE = 8;

export default function LeaveApprover1() {
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
    APPROVED:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING:
      "bg-amber-50 text-amber-700 border border-amber-200",
    REJECTED:
      "bg-rose-50 text-rose-700 border border-rose-200",
    CANCELLED:
      "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(apiEndpoints.leaveRequestForFirstApprover, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequest(Array.isArray(res.data) ? res.data : []);
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
    Swal.fire({
      title: "กำลังดำเนินการ...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByFirstApprover(detailId),
        {
          remarks:
            commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
          comment:
            commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      await Swal.fire("สำเร็จ", "อนุมัติเรียบร้อยแล้ว", "success");
      setLeaveRequest((prev) =>
        prev.filter((item) => item.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error("❌ Error approving request", error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถอนุมัติได้", "error");
    }
  };

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

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 font-kanit text-slate-800">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="font-medium">
              กำลังโหลดรายการการลาที่รออนุมัติ...
            </span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-sky-700">
                Pending Approval
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              รายการการลาที่รออนุมัติ
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ตรวจสอบและรับรองคำขอลา พร้อมระบุความคิดเห็นเพิ่มเติมได้จากที่นี่
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">จาก</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <span className="text-sm text-slate-700">ถึง</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div className="relative w-52">
              <select
                value={filterLeaveType}
                onChange={(e) => {
                  setFilterLeaveType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-sm text-slate-900 px-3 py-2 pr-8 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="">ประเภทการลาทั้งหมด</option>
                {Object.entries(leaveTypesMap).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="relative w-52">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-sm text-slate-900 px-3 py-2 pr-8 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="desc">ล่าสุดก่อน</option>
                <option value="asc">เก่าสุดก่อน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
                setFilterStatus("");
                setFilterLeaveType("");
                setCurrentPage(1);
                setSortOrder("desc");
              }}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-sm text-white rounded-lg shadow-sm transition"
            >
              ล้างตัวกรอง
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-visible bg-white">
            <table className="w-full table-auto text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
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
                      className={`px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-slate-500 ${
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
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } border-b border-slate-100 hover:bg-slate-100 transition cursor-pointer`}
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDateTime(leave.createdAt)}
                        </td>
                        <td className="px-4 py-2 whitespace-normal break-words w-[220px]">
                          {leave.user.prefixName}
                          {leave.user.firstName} {leave.user.lastName}
                        </td>
                        <td className="px-4 py-2 whitespace-normal break-words">
                          {leaveTypesMap[leave.leaveTypeId] || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              statusColors[statusKey] ||
                              "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {statusLabels[statusKey] || leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-top">
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
                              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-300"
                              placeholder="ใส่ความคิดเห็นสำหรับผู้อนุมัติถัดไป"
                            />
                            <Pencil
                              className="w-4 h-4 text-slate-400 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const result = await Swal.fire({
                                title: "รับรองคำขอลา",
                                text: "คุณแน่ใจหรือไม่ว่าต้องการรับรองคำขอลานี้",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "ใช่, รับรอง",
                                cancelButtonText: "ยกเลิก",
                                confirmButtonColor: "#16a34a",
                                cancelButtonColor: "#d33",
                              });
                              if (result.isConfirmed) {
                                handleApprove(detailId);
                              }
                            }}
                            disabled={loadingApprovals[detailId]}
                            className={`px-4 py-1 rounded-lg text-xs font-medium shadow-sm ${
                              loadingApprovals[detailId]
                                ? "bg-emerald-400/70 cursor-not-allowed text-white"
                                : "bg-emerald-500 hover:bg-emerald-400 text-white"
                            } transition`}
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
                      colSpan={8}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                ก่อนหน้า
              </button>
              <span className="px-3 py-1 text-slate-700 text-sm">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
