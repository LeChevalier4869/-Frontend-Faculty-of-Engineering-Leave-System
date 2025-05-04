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

export default function LeaveReceiver() {
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
      const token = localStorage.getItem("token");
      const res = await axios.get(apiEndpoints.leaveRequestForReceiver, {
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
    const docNum = (comments[detailId] || "").trim();
    if (!docNum) {
      return Swal.fire({
        icon: "warning",
        title: "กรุณากรอกเลขที่ใบลา",
        text: "คุณต้องกรอกเลขที่ใบลาก่อนจึงจะสามารถอนุมัติได้",
      });
    }
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    setLoadingApprovals((p) => ({ ...p, [detailId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByReceiver(detailId),
        { documentNumber: docNum, remarks: "อนุมัติ", comment: "อนุมัติ" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      Swal.fire("สำเร็จ", "อนุมัติเรียบร้อยแล้ว", "success");
      setLeaveRequest((p) =>
        p.filter((lr) => lr.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error("❌ Error approving request", error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถอนุมัติได้", "error");
    } finally {
      setLoadingApprovals((p) => ({ ...p, [detailId]: false }));
    }
  };

  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  const filtered = useMemo(() => {
    const sorted = [...leaveRequest].sort((a, b) => {
      const aT = new Date(a.createdAt), bT = new Date(b.createdAt);
      return sortOrder === "asc" ? aT - bT : bT - aT;
    });
    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");
      let okDate = true;
      if (filterStartDate && filterEndDate) {
        okDate = dayjs(created).isBetween(filterStartDate, filterEndDate, null, "[]");
      } else if (filterStartDate) {
        okDate = created >= filterStartDate;
      } else if (filterEndDate) {
        okDate = created <= filterEndDate;
      }
      const okStatus = filterStatus ? lr.status === filterStatus : true;
      const okType = filterLeaveType
        ? String(lr.leaveTypeId) === filterLeaveType
        : true;
      return okDate && okStatus && okType;
    });
  }, [leaveRequest, filterStartDate, filterEndDate, filterStatus, filterLeaveType, sortOrder]);

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
            onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
            className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-sm">ถึง</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
            className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Leave-type dropdown */}
        <div className="relative w-48">
          <select
            value={filterLeaveType}
            onChange={(e) => { setFilterLeaveType(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">ประเภทการลาทั้งหมด</option>
            {Object.entries(leaveTypesMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
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
            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="desc">ล่าสุดก่อน</option>
            <option value="asc">เก่าสุดก่อน</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown className="w-4 h-4 text-gray-500" />
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
                "เลขที่ใบลา",
                "ดำเนินการ",
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left whitespace-nowrap ${h === "ชื่อผู้ลา" ? "w-[220px]" : ""}`}
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
                const key = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(leave.createdAt)}</td>
                    <td className="px-4 py-2 w-[220px] whitespace-nowrap">
                      {leave.user.prefixName}{leave.user.firstName} {leave.user.lastName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{leaveTypesMap[leave.leaveTypeId] || "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(leave.startDate)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(leave.endDate)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`px-4 py-1 whitespace-nowrap rounded-full text-xs font-semibold ${
                          statusColors[key] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[key] || leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={comments[detailId] || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setComments((c) => ({ ...c, [detailId]: e.target.value }))
                          }
                          className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                          placeholder="กรุณาใส่เลขที่ใบลา"
                          required
                        />
                        <Pencil
                          className="w-5 h-5 text-gray-500 cursor-pointer"
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
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "ใช่, รับรอง",
                            cancelButtonText: "ยกเลิก",
                            confirmButtonColor: "#16a34a",
                            cancelButtonColor: "#d33",
                          });
                          if (result.isConfirmed) handleApprove(detailId);
                        }}
                        disabled={loadingApprovals[detailId]}
                        className={`px-4 py-1 rounded text-white ${
                          loadingApprovals[detailId]
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {loadingApprovals[detailId] ? "ตกลง" : "ตกลง"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500 whitespace-nowrap">
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
