import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

dayjs.extend(isBetween);

const PAGE_SIZE = 10;

export default function LeaveApprover4() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [comments, setComments] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingApprovals, setLoadingApprovals] = useState({});
  
  // เพิ่ม state สำหรับ proxy selection
  const [selectedProxy, setSelectedProxy] = useState(null);

  // อ่าน proxy parameter จาก URL
  useEffect(() => {
    const proxyId = searchParams.get('proxy');
    if (proxyId) {
      const proxyIdNum = parseInt(proxyId);
      setSelectedProxy({ id: proxyIdNum });
      console.log('🎯 LeaveApprover4 - Proxy selected from URL:', proxyIdNum);
    } else {
      setSelectedProxy(null);
    }
  }, []);

  // ตรวจสอบ URL parameter เมื่อเปลี่ยน
  useEffect(() => {
    const proxyId = searchParams.get('proxy');
    if (proxyId) {
      const proxyIdNum = parseInt(proxyId);
      setSelectedProxy({ id: proxyIdNum });
      console.log('🔄 LeaveApprover4 - URL parameter changed, updating proxy:', proxyIdNum);
    } else {
      setSelectedProxy(null);
      console.log('🔄 LeaveApprover4 - URL parameter cleared, clearing proxy selection');
    }
  }, [searchParams]); // ลบ selectedProxy ออกเพื่อป้องกัน infinite loop
  
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
      
      // ดึงข้อมูลจาก proxy API แทนที่เดิม
      const res = await axios.get(apiEndpoints.getApproversForLevel(5, new Date().toISOString().split('T')[0]), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('🔍 Debug - LeaveApprover4 - Proxy API Response:', res.data);
      
      // ตรวจสอบว่า User11 เป็น proxy หรือไม่
      const approvers = res.data.data || [];
      const user11Proxy = approvers.find(a => a.id === 11 && a.isProxy);
      console.log('👤 User11 is proxy for level 5:', user11Proxy);
      
      // ใช้ API endpoint สำหรับ approver (ทำงานเหมือนกันทั้ง proxy และปกติ)
      console.log('🔄 Using approver API endpoint');
      const apiUrl = apiEndpoints.leaveRequestForFouthApprover;
      
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
  }, [selectedProxy]); // รันเมื่อ selectedProxy เปลี่ยนเท่านั้น

  const handleApprove = async (detailId) => {
    const text = (comments[detailId] || "").trim();
    setLoadingApprovals((p) => ({ ...p, [detailId]: true }));
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByFouthApprover(detailId),
        {
          remarks: text || "อนุมัติเนื่องจากเห็นสมควร",
          comment: text || "อนุมัติเนื่องจากเห็นสมควร",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      Swal.fire("สำเร็จ", "อนุมัติเรียบร้อยแล้ว", "success");
      setLeaveRequest((p) =>
        p.filter((i) => i.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถอนุมัติได้", "error");
    } finally {
      setLoadingApprovals((p) => ({ ...p, [detailId]: false }));
    }
  };

  const handleReject = async (detailId) => {
    const text = (comments[detailId] || "").trim();
    setLoadingApprovals((p) => ({ ...p, [detailId]: true }));
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.RejectleaveRequestsByFouthApprover(detailId),
        {
          remarks: text || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
          comment: text || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.close();
      Swal.fire("สำเร็จ", "ปฏิเสธเรียบร้อยแล้ว", "success");
      setLeaveRequest((p) =>
        p.filter((i) => i.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire("ผิดพลาด", "ไม่สามารถปฏิเสธได้", "error");
    } finally {
      setLoadingApprovals((p) => ({ ...p, [detailId]: false }));
    }
  };

  const formatDateTime = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm"); // สำหรับ createdAt
    const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY"); // สำหรับ startDate และ endDate
    

  const filtered = useMemo(() => {
    const sorted = [...leaveRequest].sort((a, b) => {
      const aT = new Date(a.createdAt),
        bT = new Date(b.createdAt);
      return sortOrder === "asc" ? aT - bT : bT - aT;
    });

    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");
      let ok = true;
      if (filterStartDate && filterEndDate) {
        ok = dayjs(created).isBetween(
          filterStartDate,
          filterEndDate,
          null,
          "[]"
        );
      } else if (filterStartDate) {
        ok = created >= filterStartDate;
      } else if (filterEndDate) {
        ok = created <= filterEndDate;
      }
      const okType = filterLeaveType
        ? String(lr.leaveTypeId) === filterLeaveType
        : true;
      return ok && okType;
    });
  }, [
    leaveRequest,
    filterStartDate,
    filterEndDate,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          รายการการลาที่รออนุมัติ (ระดับ 4)
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Date filters */}
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

        {/* Leave Type dropdown */}
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

        {/* Sort Order dropdown */}
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
            setFilterLeaveType("");
            setSortOrder("desc");
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          ล้าง
        </button>
      </div>

      {/* Table */}
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
                  className={`px-4 py-3 text-left whitespace-nowrap ${
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
                const key = (leave.status || "").toUpperCase();
                return (
                  <tr
                    key={leave.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition cursor-pointer`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(leave.createdAt)}
                    </td>
                    <td className="px-4 py-2 w-[220px] whitespace-nowrap">
                      {leave.user.prefixName}
                      {leave.user.firstName} {leave.user.lastName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {leaveTypesMap[leave.leaveTypeId] || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDate(leave.endDate)}
                    </td>
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
                            setComments((c) => ({
                              ...c,
                              [detailId]: e.target.value,
                            }))
                          }
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 whitespace-nowrap"
                          placeholder="ใส่ความคิดเห็น"
                        />
                        <Pencil
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          handleApprove(detailId);
                        }}
                        disabled={loadingApprovals[detailId]}
                        className={`px-4 py-1 rounded text-white ${
                          loadingApprovals[detailId]
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {loadingApprovals[detailId] ? "อนุมัติ" : "อนุมัติ"}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          handleReject(detailId);
                        }}
                        disabled={loadingApprovals[detailId]}
                        className={`px-4 py-1 rounded text-white ${
                          loadingApprovals[detailId]
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {loadingApprovals[detailId] ? "ไม่อนุมัติ" : "ไม่อนุมัติ"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-6 text-center text-gray-500 whitespace-nowrap"
                >
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-lg px-4 py-3 border border-slate-200">
          <div className="text-sm text-slate-700">
            แสดง {(currentPage - 1) * PAGE_SIZE + 1} ถึง {Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            {(() => {
              const pages = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage <= 4) {
                  pages.push(2, 3, 4, 5, '...', totalPages);
                } else if (currentPage >= totalPages - 3) {
                  pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                  pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                }
              }
              return pages.map((page, idx) => {
                if (page === '...') {
                  return <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page ? 'z-10 bg-sky-50 border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
