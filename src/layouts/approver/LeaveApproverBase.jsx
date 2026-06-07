import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, CalendarDays, FileText, Clock } from "lucide-react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { API, apiEndpoints } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";

dayjs.extend(isBetween);

const PAGE_SIZE = 8;

const statusLabels = {
  APPROVED: "อนุมัติแล้ว",
  PENDING: "รออนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
};

const statusColors = {
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border border-slate-200",
};

/**
 * Component กลางสำหรับหน้า "รายการการลาที่รออนุมัติ" ของผู้อนุมัติทุกระดับ (Approver 1-4)
 * รับ config ของแต่ละระดับผ่าน props:
 *  - listUrl: URL สำหรับดึงรายการคำขอที่รออนุมัติของระดับนั้น
 *  - approveUrl(detailId): สร้าง URL สำหรับอนุมัติ
 *  - rejectUrl(detailId): สร้าง URL สำหรับปฏิเสธ
 */
export default function LeaveApproverBase({ listUrl, approveUrl, rejectUrl }) {
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
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get(listUrl);
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
      const res = await API.get(apiEndpoints.availableLeaveType);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  const handleApprove = async (detailId) => {
    const commentFromInput = (comments[detailId] || "").trim();
    setLoadingApprovals((prev) => ({ ...prev, [detailId]: true }));
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await API.patch(approveUrl(detailId), {
        remarks: commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
        comment: commentFromInput || "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
      });
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อนุมัติเรียบร้อยแล้ว",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true, // ปุ่มกากบาทปิดแบบแมนนวล
        allowOutsideClick: true, // คลิกพื้นที่ด้านนอกเพื่อปิดได้
      });
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
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await API.patch(rejectUrl(detailId), {
        remarks: commentFromInput || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
        comment: commentFromInput || "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
      });
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ปฏิเสธเรียบร้อยแล้ว",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true, // ปุ่มกากบาทปิดแบบแมนนวล
        allowOutsideClick: true, // คลิกพื้นที่ด้านนอกเพื่อปิดได้
      });
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
  }, [
    leaveRequest,
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterLeaveType,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดรายการการลาที่รออนุมัติ..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">
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
                className="bg-white text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <span className="text-sm text-slate-700">ถึง</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-sm text-slate-900 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <div className="relative w-52">
              <select
                value={filterLeaveType}
                onChange={(e) => {
                  setFilterLeaveType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-sm text-slate-900 px-3 py-2 pr-8 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-300"
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
                className="w-full bg-white text-sm text-slate-900 px-3 py-2 pr-8 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-300"
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

          {/* รายการคำขอ: การ์ด (responsive, ไม่ใช้ overflow-x) */}
          {displayItems.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {displayItems.map((leave) => {
                const detailId = leave.leaveRequestDetails?.[0]?.id;
                const statusKey = (leave.status || "").toUpperCase();
                const initials = `${leave.user?.firstName?.[0] || ""}${leave.user?.lastName?.[0] || ""}`.toUpperCase();
                const dayCount =
                  leave.thisTimeDays ??
                  leave.leavedDays ??
                  (dayjs(leave.endDate).diff(dayjs(leave.startDate), "day") + 1);
                return (
                  <div
                    key={leave.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    {/* หัวการ์ด: ผู้ลา + สถานะ */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold ring-1 ring-brand-100">
                          {initials || "—"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {leave.user.prefixName}
                            {leave.user.firstName} {leave.user.lastName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            ยื่นเมื่อ {formatDateTime(leave.createdAt)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          statusColors[statusKey] ||
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {statusLabels[statusKey] || leave.status}
                      </span>
                    </div>

                    {/* รายละเอียดการลา */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
                          <FileText className="w-3.5 h-3.5" /> ประเภทการลา
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5 break-words">
                          {leaveTypesMap[leave.leaveTypeId] || "-"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
                          <CalendarDays className="w-3.5 h-3.5" /> วันเริ่มต้น
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">
                          {formatDate(leave.startDate)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400">
                          <CalendarDays className="w-3.5 h-3.5" /> วันสิ้นสุด
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">
                          {formatDate(leave.endDate)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                          จำนวนวัน
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">
                          {dayCount} วัน
                        </div>
                      </div>
                    </div>

                    {leave.reason ? (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                          เหตุผลการลา
                        </div>
                        <div className="text-sm text-slate-700 mt-0.5 break-words">
                          {leave.reason}
                        </div>
                      </div>
                    ) : null}

                    {/* กล่องความคิดเห็น (ใหญ่ขึ้น เป็น textarea) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        ความคิดเห็นถึงผู้อนุมัติถัดไป{" "}
                        <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={comments[detailId] || ""}
                        onChange={(e) =>
                          setComments((c) => ({ ...c, [detailId]: e.target.value }))
                        }
                        className="w-full resize-y bg-white text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-slate-400"
                        placeholder="ใส่ความคิดเห็น/หมายเหตุสำหรับผู้อนุมัติถัดไป..."
                      />
                    </div>

                    {/* ปุ่มดำเนินการ */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/leave/${leave.id}`)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleReject(detailId)}
                        disabled={loadingApprovals[detailId]}
                        className={`inline-flex items-center justify-center px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition ${
                          loadingApprovals[detailId]
                            ? "bg-rose-300 cursor-not-allowed text-white"
                            : "bg-rose-500 hover:bg-rose-600 text-white"
                        }`}
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleApprove(detailId)}
                        disabled={loadingApprovals[detailId]}
                        className={`inline-flex items-center justify-center px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition ${
                          loadingApprovals[detailId]
                            ? "bg-emerald-300 cursor-not-allowed text-white"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        }`}
                      >
                        {loadingApprovals[detailId] ? "กำลังดำเนินการ..." : "อนุมัติ"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              ไม่มีข้อมูลการลา
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 bg-white rounded-lg px-4 py-3 border border-slate-200">
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
                      pages.push(2, 3, 4, 5, "...", totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                    }
                  }
                  return pages.map((page, idx) => {
                    if (page === "...") {
                      return <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page ? "z-10 bg-brand-50 border-brand-500 text-brand-600" : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
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
      </div>
    </div>
  );
}

LeaveApproverBase.propTypes = {
  listUrl: PropTypes.string.isRequired,
  approveUrl: PropTypes.func.isRequired,
  rejectUrl: PropTypes.func.isRequired,
};
