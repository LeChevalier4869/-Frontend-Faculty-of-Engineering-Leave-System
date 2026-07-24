import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Clock } from "lucide-react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { API, apiEndpoints } from "../../utils/api";
import { scrollMainToTop } from "../../utils/scroll";
import LoadingSpinner from "../../components/LoadingSpinner";

dayjs.extend(isBetween);

const PAGE_SIZE = 12;

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
 * Component กลางสำหรับหน้า "รายการการลาที่รออนุมัติ" ของผู้อนุมัติทุกระดับ (Approver 1-4 และผู้ตรวจสอบ)
 * รับ config ของแต่ละระดับผ่าน props:
 *  - listUrl: URL สำหรับดึงรายการคำขอที่รออนุมัติของระดับนั้น
 *  - approveUrl(detailId): สร้าง URL สำหรับอนุมัติ
 *  - rejectUrl(detailId): สร้าง URL สำหรับปฏิเสธ
 *  - approveLabel/rejectLabel: คำบนปุ่ม (เช่น ผู้ตรวจสอบใช้ "ผ่าน"/"ไม่ผ่าน" แทน "อนุมัติ"/"ปฏิเสธ")
 *  - showComment: แสดงช่องความคิดเห็นหรือไม่ (ผู้ตรวจสอบไม่แสดงความคิดเห็น)
 *  - approveRemark/rejectRemark: หมายเหตุเริ่มต้นที่บันทึกเมื่อไม่ได้กรอกความคิดเห็น
 */
export default function LeaveApproverBase({
  listUrl,
  approveUrl,
  rejectUrl,
  approveLabel = "อนุมัติ",
  rejectLabel = "ปฏิเสธ",
  showComment = true,
  approveRemark = "อนุมัติเนื่องจากเห็นสมควร โปรดพิจารณา",
  rejectRemark = "ปฏิเสธเนื่องจากไม่ผ่านเกณฑ์",
  title = "รายการการลาที่รออนุมัติ",
  subtitle = "ตรวจสอบและรับรองคำขอลา พร้อมระบุความคิดเห็นเพิ่มเติมได้จากที่นี่",
}) {
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
  const [expandedComment, setExpandedComment] = useState(null);

  // เปลี่ยนหน้าแล้วเลื่อนขึ้นบนสุด (รายการยาว กดหน้าถัดไปแล้วไม่ค้างอยู่ล่างสุด)
  // ตัว scroll จริงคือ <main> ใน AppLayout ไม่ใช่ window จึงใช้ helper เลื่อน element นั้น
  const goToPage = (page) => {
    setCurrentPage(page);
    scrollMainToTop();
  };

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
        remarks: commentFromInput || approveRemark,
        comment: commentFromInput || approveRemark,
      });
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: `${approveLabel}เรียบร้อยแล้ว`,
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
      Swal.fire("ผิดพลาด", `ไม่สามารถ${approveLabel}ได้`, "error");
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
        remarks: commentFromInput || rejectRemark,
        comment: commentFromInput || rejectRemark,
      });
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: `${rejectLabel}เรียบร้อยแล้ว`,
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
      Swal.fire("ผิดพลาด", `ไม่สามารถ${rejectLabel}ได้`, "error");
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
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {subtitle}
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

          {/* รายการคำขอ: แถวกะทัดรัด (1 record ต่อแถว) — เห็นภาพรวมได้เร็ว อนุมัติได้ทันที */}
          {displayItems.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              {displayItems.map((leave) => {
                const detailId = leave.leaveRequestDetails?.[0]?.id;
                const statusKey = (leave.status || "").toUpperCase();
                const initials = `${leave.user?.firstName?.[0] || ""}${leave.user?.lastName?.[0] || ""}`.toUpperCase();
                const dayCount =
                  leave.thisTimeDays ??
                  leave.leavedDays ??
                  (dayjs(leave.endDate).diff(dayjs(leave.startDate), "day") + 1);
                const busy = loadingApprovals[detailId];
                const commentOpen = expandedComment === detailId;
                const hasComment = (comments[detailId] || "").trim().length > 0;
                return (
                  <div key={leave.id} className="px-4 py-3 transition hover:bg-slate-50/60">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      {/* ผู้ลา */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
                          {initials || "—"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {leave.user.prefixName}
                            {leave.user.firstName} {leave.user.lastName}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            ยื่นเมื่อ {formatDateTime(leave.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* ข้อมูลลา (แนวนอน) */}
                      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-sm lg:justify-end">
                        <div className="min-w-0">
                          <span className="text-slate-400">ประเภท: </span>
                          <span className="font-medium text-slate-800">{leaveTypesMap[leave.leaveTypeId] || "-"}</span>
                        </div>
                        <div className="whitespace-nowrap">
                          <span className="text-slate-400">วันลา: </span>
                          <span className="font-medium text-slate-800">
                            {formatDate(leave.startDate)}
                            {formatDate(leave.startDate) !== formatDate(leave.endDate) && ` – ${formatDate(leave.endDate)}`}
                          </span>
                          <span className="ml-1 text-slate-500">({dayCount} วัน)</span>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[statusKey] || "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                          {statusLabels[statusKey] || leave.status}
                        </span>
                      </div>

                      {/* ปุ่มดำเนินการ */}
                      <div className="flex shrink-0 items-center gap-2 lg:pl-2">
                        <button
                          onClick={() => navigate(`/leave/${leave.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                          title="ดูรายละเอียด"
                        >
                          รายละเอียด
                        </button>
                        {showComment && (
                          <button
                            onClick={() => setExpandedComment(commentOpen ? null : detailId)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                              hasComment || commentOpen
                                ? "border-brand-200 bg-brand-50 text-brand-700"
                                : "border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                            title="เพิ่มความคิดเห็น"
                          >
                            ความคิดเห็น
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(detailId)}
                          disabled={busy}
                          className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition ${busy ? "cursor-not-allowed bg-rose-300" : "bg-rose-500 hover:bg-rose-600"}`}
                        >
                          {rejectLabel}
                        </button>
                        <button
                          onClick={() => handleApprove(detailId)}
                          disabled={busy}
                          className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition ${busy ? "cursor-not-allowed bg-emerald-300" : "bg-emerald-500 hover:bg-emerald-600"}`}
                        >
                          {busy ? "กำลัง..." : approveLabel}
                        </button>
                      </div>
                    </div>

                    {/* เหตุผลการลา (ถ้ามี) — บรรทัดเดียว ตัดด้วย ellipsis */}
                    {leave.reason && (
                      <p className="mt-1.5 truncate pl-[52px] text-xs text-slate-500" title={leave.reason}>
                        <span className="text-slate-400">เหตุผล: </span>{leave.reason}
                      </p>
                    )}

                    {/* ช่องความคิดเห็น — แสดงเมื่อกดเปิดเท่านั้น ไม่บวมทุกแถว */}
                    {showComment && commentOpen && (
                      <textarea
                        rows={2}
                        autoFocus
                        value={comments[detailId] || ""}
                        onChange={(e) => setComments((c) => ({ ...c, [detailId]: e.target.value }))}
                        className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
                        placeholder="ความคิดเห็น/หมายเหตุถึงผู้อนุมัติถัดไป (ไม่บังคับ)..."
                      />
                    )}
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
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => goToPage(page)}
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
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
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
  approveLabel: PropTypes.string,
  rejectLabel: PropTypes.string,
  showComment: PropTypes.bool,
  approveRemark: PropTypes.string,
  rejectRemark: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
