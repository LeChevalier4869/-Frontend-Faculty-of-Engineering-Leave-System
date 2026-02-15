import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown } from "lucide-react";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";

dayjs.extend(isBetween);

const PAGE_SIZE = 10;

export default function LeaveVerifier() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvers, setApprovers] = useState([]); // เพิ่ม state สำหรับ approvers
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [loadingApprovals, setLoadingApprovals] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // เพิ่ม state สำหรับ proxy selection
  const [selectedProxy, setSelectedProxy] = useState(null);
  
  // อ่าน proxy parameter จาก URL
  useEffect(() => {
    const proxyId = searchParams.get('proxy');
    if (proxyId) {
      const proxyIdNum = parseInt(proxyId);
      setSelectedProxy({ id: proxyIdNum });
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
    } else {
      setSelectedProxy(null);
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
      const res = await axios.get(apiEndpoints.getApproversForLevel(2, new Date().toISOString().split('T')[0]), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // แยก approvers เป็น regular และ proxy
      const approvers = res.data.data || [];
      const regularApprovers = approvers.filter(a => !a.isProxy);
      const proxyApprovers = approvers.filter(a => a.isProxy);
      
      // ถ้ามี selectedProxy จาก URL ให้ตรวจสอบว่ามีอยู่ใน approvers
      if (selectedProxy) {
        const foundProxy = approvers.find(a => a.id === selectedProxy.id);
        if (foundProxy) {
          // ไม่ต้อง setSelectedProxy ที่นี่เพื่อหลีกเลี่ยง infinite loop
        } else {
          // ไม่ต้อง setSelectedProxy ที่นี่เพื่อหลีกเลี่ยง infinite loop
        }
      }
      
      // ใช้ API endpoint สำหรับ verifier (ทำงานเหมือนกันทั้ง proxy และปกติ)
      const apiUrl = apiEndpoints.leaveRequestForVerifier;
      
      const res2 = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // ตั้งค่าข้อมูลคำขอลาโดยตรงจาก res2.data
      const data = Array.isArray(res2.data) ? res2.data : [];
      setLeaveRequest(data);
      
      // บันทึกข้อมูล approvers สำหรับการแสดงใน UI
      setApprovers(approvers);
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

  const fetchApprovers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(apiEndpoints.getApproversForLevel(2, today), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setApprovers(data);
    } catch (err) {
      console.error("Error fetching approvers:", err);
      setApprovers([]);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
    fetchApprovers();
  }, [selectedProxy]); // รันเมื่อ selectedProxy เปลี่ยนเท่านั้น

  const handleApprove = async (detailId) => {
    setLoadingApprovals((p) => ({ ...p, [detailId]: true }));
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByVerifier(detailId),
        { remarks: "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา", comment: "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา" },
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
      setLoadingApprovals((p) => ({ ...p, [detailId]: false }));
    }
  };

  const handleReject = async (detailId) => {
    setLoadingApprovals((p) => ({ ...p, [detailId]: true }));
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        apiEndpoints.RejectleaveRequestsByVerifier(detailId),
        { remarks: "ปฏิเสธ", comment: "ปฏิเสธ" },
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
      setLoadingApprovals((p) => ({ ...p, [detailId]: false }));
    }
  };

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY");

  const filtered = useMemo(() => {
    // ตรวจสอบว่า leaveRequest เป็น array ก่อน
    if (!Array.isArray(leaveRequest)) {
      return [];
    }
    
    const sorted = [...leaveRequest].sort((a, b) => {
      const dateA = new Date(a.createdAt),
        dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");
      let byDate = true;
      if (filterStartDate && filterEndDate) {
        byDate = dayjs(created).isBetween(filterStartDate, filterEndDate, null, "[]");
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
  }, [leaveRequest, filterStartDate, filterEndDate, filterStatus, filterLeaveType, sortOrder]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((filtered?.length || 0) / PAGE_SIZE);
  const displayItems = (filtered || []).slice(
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">รายการการลาที่รออนุมัติ</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm">จาก</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-sm">ถึง</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Proxy Selector */}
        {approvers.filter(a => a.isProxy).length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Proxy:</label>
            <select
              value={selectedProxy?.id || ""}
              onChange={(e) => {
                const proxyId = parseInt(e.target.value);
                const proxy = approvers.find(a => a.id === proxyId);
                setSelectedProxy(proxy);
                setCurrentPage(1);
                console.log('🔄 Selected proxy:', proxy?.firstName, proxy?.lastName);
              }}
              className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">ทั้งหมด</option>
              {approvers.filter(a => a.isProxy).map((proxy) => (
                <option key={proxy.id} value={proxy.id}>
                  {proxy.firstName} {proxy.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative w-48">
          <select
            value={filterLeaveType}
            onChange={(e) => {
              setFilterLeaveType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
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

        <div className="relative w-48">
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
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

      {/* Table */}
      <div className="rounded-lg shadow border border-gray-300 overflow-hidden overflow-x-auto width-full">
        <table className="min-w-full bg-white text-sm text-black">
          <thead>
            <tr className="bg-gray-100 text-gray-800 whitespace-nowrap">
              {[
                "วันที่ยื่น",
                "ชื่อผู้ลา",
                "ประเภทการลา",
                "วันเริ่มต้น",
                "วันสิ้นสุด",
                "สถานะ",
                "ดำเนินการ",
                "Proxy",
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-2 text-left ${
                    h === "ชื่อผู้ลา" ? "w-[220px]" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(displayItems || []).length > 0 ? (
              (displayItems || []).map((leave, idx) => {
                const detailId = leave.leaveRequestDetails?.[0]?.id;
                const statusKey = (leave.status || "").toUpperCase();
                
                // ตรวจสอว่า request นี้มีการกำหนัด proxy หรือไม่
                const hasProxyDetail = leave.leaveRequestDetails?.some(detail => detail.proxyApprovalId !== null);
                const proxyDetail = leave.leaveRequestDetails?.find(detail => detail.proxyApprovalId !== null);
                
                return (
                  <tr
                    key={leave.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition cursor-pointer ${
                      hasProxyDetail ? "ring-2 ring-blue-200" : ""
                    }`}
                    onClick={() => navigate(`/leave/${leave.id}`)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(leave.createdAt)}
                    </td>
                    <td className="px-4 py-2 w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {leave.user.prefixName} {leave.user.firstName} {leave.user.lastName}
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
                    <td className="px-2 py-2">
                      <span
                        className={`inline-block whitespace-nowrap px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColors[statusKey] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[statusKey] || leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {proxyDetail ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Proxy: {proxyDetail.proxyApprover?.firstName} {proxyDetail.proxyApprover?.lastName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
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
                            className={`px-4 py-1 rounded text-white ${
                              loadingApprovals[detailId]
                                ? "bg-green-300 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            ผ่าน
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const result = await Swal.fire({
                                title: "ปฏิเสธคำขอลา",
                                text: "คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอลานี้",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "ใช่, ปฏิเสธ",
                                cancelButtonText: "ยกเลิก",
                                confirmButtonColor: "#d33",
                                cancelButtonColor: "#3085d6",
                              });
                              if (result.isConfirmed) {
                                handleReject(detailId);
                              }
                            }}
                            disabled={loadingApprovals[detailId]}
                            className={`px-4 py-1 rounded text-white ${
                              loadingApprovals[detailId]
                                ? "bg-red-300 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {proxyDetail ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Proxy: {proxyDetail.proxyApprover?.firstName} {proxyDetail.proxyApprover?.lastName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            Regular
                          </span>
                        </div>
                      )}
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
