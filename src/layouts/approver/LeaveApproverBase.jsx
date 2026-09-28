import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Clock, ExternalLink, Paperclip } from "lucide-react";
import Swal, { notifySuccess, notifyError } from "../../utils/alert";
import PropTypes from "prop-types";
import { API, apiEndpoints } from "../../utils/api";
import { scrollMainToTop } from "../../utils/scroll";
import LoadingSpinner from "../../components/LoadingSpinner";
import LeaveSubmissionBadge from "../../components/common/LeaveSubmissionBadge";
import {
  isSubmittedByAdmin,
  leaveCategoryLabel,
} from "../../utils/leaveSubmission";

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

// ตำแหน่งในสายอนุมัติตามขั้น (stepOrder) — ให้ตรงกับหน้ารายละเอียดใบลา
const POSITION_BY_STEP = {
  1: "หัวหน้าสาขา",
  2: "สารบรรณคณะ",
  4: "หัวหน้าสำนักงานคณบดี",
  5: "รองคณบดีฝ่ายบริหาร",
  6: "คณบดี",
};

const personName = (u) =>
  u ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim() : "";

/**
 * Component กลางสำหรับหน้า "รายการการลาที่รออนุมัติ" ของผู้อนุมัติทุกระดับ (Approver 1-4 และผู้ตรวจสอบ)
 * รับ config ของแต่ละระดับผ่าน props:
 *  - listUrl: URL สำหรับดึงรายการคำขอที่รออนุมัติของระดับนั้น
 *  - approveUrl(detailId): สร้าง URL สำหรับอนุมัติ
 *  - rejectUrl(detailId): สร้าง URL สำหรับปฏิเสธ
 *  - approveLabel/rejectLabel: คำบนปุ่ม (เช่น ผู้ตรวจสอบใช้ "ผ่าน"/"ไม่ผ่าน" แทน "อนุมัติ"/"ปฏิเสธ")
 *  - showComment: แสดงช่องความคิดเห็นหรือไม่ (ผู้ตรวจสอบไม่แสดงความคิดเห็น)
 *  - approveRemark/rejectRemark: หมายเหตุเริ่มต้นที่บันทึกเมื่อไม่ได้กรอกความคิดเห็น
 *
 * ปุ่มอนุมัติ/ปฏิเสธอยู่ท้ายการ์ดรายละเอียดเท่านั้น — ผู้อนุมัติต้องกด "รายละเอียด"
 * เพื่อเปิดอ่านข้อมูลใบลาก่อนจึงจะดำเนินการได้
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
  const [comments, setComments] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingApprovals, setLoadingApprovals] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  // การ์ดรายละเอียดที่เปิดอยู่ (ทีละใบ) + ข้อมูลเต็มของใบลาที่โหลดมาแล้ว (key = leaveRequest.id)
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});

  // เปลี่ยนหน้าแล้วเลื่อนขึ้นบนสุด (รายการยาว กดหน้าถัดไปแล้วไม่ค้างอยู่ล่างสุด)
  // ตัว scroll จริงคือ <main> ใน AppLayout ไม่ใช่ window จึงใช้ helper เลื่อน element นั้น
  const goToPage = (page) => {
    setCurrentPage(page);
    setExpandedId(null);
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

  useEffect(() => {
    fetchLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  // ชื่อประเภทลามากับคำขอแต่ละรายการ — ใช้ทำตัวเลือกกรองด้วย
  // (เดิมดึงจาก /leave-types/available ซึ่งไม่มีประเภทที่แอดมินยื่นให้ ชื่อเลยขึ้น "-")
  const leaveTypesMap = useMemo(() => {
    const map = {};
    leaveRequest.forEach((lr) => {
      if (lr.leaveType?.id != null) map[lr.leaveType.id] = lr.leaveType.name;
    });
    return map;
  }, [leaveRequest]);

  // โหลดข้อมูลเต็มของใบลา (ตำแหน่งผู้ลา, ความเห็นผู้อนุมัติก่อนหน้า) ครั้งแรกที่เปิดการ์ด
  const loadDetail = async (leaveId) => {
    if (details[leaveId]?.data || details[leaveId]?.loading) return;
    setDetails((d) => ({ ...d, [leaveId]: { loading: true } }));
    try {
      const res = await API.get(apiEndpoints.getLeaveById(leaveId));
      setDetails((d) => ({
        ...d,
        [leaveId]: { data: res?.data?.data ?? null },
      }));
    } catch (err) {
      console.error("Error loading leave detail:", err);
      setDetails((d) => ({ ...d, [leaveId]: { error: true } }));
    }
  };

  const toggleExpand = (leaveId) => {
    if (expandedId === leaveId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(leaveId);
    loadDetail(leaveId);
  };

  const submitDecision = async (detailId, kind) => {
    const isApprove = kind === "approve";
    const label = isApprove ? approveLabel : rejectLabel;
    const commentFromInput = (comments[detailId] || "").trim();
    const fallback = isApprove ? approveRemark : rejectRemark;
    setLoadingApprovals((prev) => ({ ...prev, [detailId]: true }));
    Swal.fire({
      title: "กำลังดำเนินการ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await API.patch((isApprove ? approveUrl : rejectUrl)(detailId), {
        remarks: commentFromInput || fallback,
        comment: commentFromInput || fallback,
      });
      Swal.close();
      await notifySuccess("สำเร็จ", `${label}เรียบร้อยแล้ว`);
      setExpandedId(null);
      setLeaveRequest((prev) =>
        prev.filter((item) => item.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (error) {
      console.error(`❌ Error ${kind} request`, error);
      Swal.close();
      notifyError(
        "ผิดพลาด",
        error?.response?.data?.message || `ไม่สามารถ${label}ได้`
      );
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

          {/* รายการคำขอ: แถวสรุป 1 ใบต่อแถว — กด "รายละเอียด" เพื่อเปิดการ์ดอ่านข้อมูลและดำเนินการ */}
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
                const isOpen = expandedId === leave.id;
                const dateRange =
                  formatDate(leave.startDate) +
                  (formatDate(leave.startDate) !== formatDate(leave.endDate)
                    ? ` – ${formatDate(leave.endDate)}`
                    : "");
                return (
                  <div
                    key={leave.id}
                    className={`transition ${isOpen ? "bg-brand-50/30" : "hover:bg-slate-50/60"}`}
                  >
                    <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                      {/* ผู้ลา */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
                          {initials || "—"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {personName(leave.user)}
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
                          <span className="font-medium text-slate-800">
                            {leave.leaveType?.name || leaveTypesMap[leave.leaveTypeId] || "-"}
                          </span>
                        </div>
                        <div className="whitespace-nowrap">
                          <span className="text-slate-400">วันลา: </span>
                          <span className="font-medium text-slate-800">{dateRange}</span>
                          <span className="ml-1 text-slate-500">({dayCount} วัน)</span>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[statusKey] || "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                          {statusLabels[statusKey] || leave.status}
                        </span>
                      </div>

                      {/* เปิด/ปิดการ์ดรายละเอียด */}
                      <div className="flex shrink-0 items-center lg:pl-2">
                        <button
                          onClick={() => toggleExpand(leave.id)}
                          aria-expanded={isOpen}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            isOpen
                              ? "border-brand-300 bg-brand-100 text-brand-700"
                              : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                          }`}
                        >
                          รายละเอียด
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* การ์ดรายละเอียด — เลื่อนลงมาเมื่อกดเปิด (grid-rows 0fr → 1fr ให้ animate ความสูงได้) */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {isOpen && (
                          <DetailCard
                            leave={leave}
                            detail={details[leave.id]}
                            dateRange={dateRange}
                            dayCount={dayCount}
                            formatDate={formatDate}
                            showComment={showComment}
                            comment={comments[detailId] || ""}
                            onCommentChange={(v) =>
                              setComments((c) => ({ ...c, [detailId]: v }))
                            }
                            busy={!!loadingApprovals[detailId]}
                            canAct={detailId != null}
                            approveLabel={approveLabel}
                            rejectLabel={rejectLabel}
                            onApprove={() => submitDecision(detailId, "approve")}
                            onReject={() => submitDecision(detailId, "reject")}
                            onOpenFull={() => navigate(`/leave/${leave.id}`)}
                          />
                        )}
                      </div>
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

/**
 * การ์ดรายละเอียดใบลา: ข้อมูลที่จำเป็นต่อการพิจารณา → ช่องความคิดเห็น → ปุ่มอนุมัติ/ปฏิเสธ
 * ข้อมูลพื้นฐานมากับรายการอยู่แล้ว ส่วนตำแหน่งผู้ลาและความเห็นของผู้อนุมัติก่อนหน้าโหลดเพิ่มตอนเปิด
 */
function DetailCard({
  leave,
  detail,
  dateRange,
  dayCount,
  formatDate,
  showComment,
  comment,
  onCommentChange,
  busy,
  canAct,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  onOpenFull,
}) {
  const full = detail?.data;
  const user = full?.user || leave.user;
  const leaveType = full?.leaveType || leave.leaveType;
  const files = full?.files || leave.files || [];
  const category = leaveCategoryLabel(leaveType);
  // ความเห็นของขั้นก่อนหน้าที่ดำเนินการแล้ว (ไม่รวมขั้นที่รอเราอยู่)
  const priorSteps = (full?.approvalSteps || [])
    .filter((s) => s.status && s.status !== "PENDING")
    .sort((a, b) => (Number(a.stepOrder) || 0) - (Number(b.stepOrder) || 0));

  return (
    <div className="px-4 pb-4">
      <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm md:p-5">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="ผู้ลา" value={personName(user)} />
          <InfoItem
            label="ตำแหน่ง / สาขา"
            value={
              [full ? user?.position : null, user?.department?.name]
                .filter(Boolean)
                .join(" · ") || (detail?.loading ? "กำลังโหลด..." : "-")
            }
          />
          <InfoItem
            label="ประเภทการลา"
            value={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span>{leaveType?.name || "-"}</span>
                {category && (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-normal text-slate-600">
                    {category}
                  </span>
                )}
              </span>
            }
          />
          <InfoItem label="วันที่ลา" value={`${dateRange} (${dayCount} วัน)`} />
          <InfoItem
            label="ผู้ยื่นใบลาลงระบบ"
            value={
              <span className="inline-flex items-center gap-1.5">
                <LeaveSubmissionBadge leave={full || leave} size="sm" />
                {isSubmittedByAdmin(full || leave) && full?.createdBy && (
                  <span className="text-xs font-normal text-slate-500">
                    {personName(full.createdBy)}
                  </span>
                )}
              </span>
            }
          />
          <InfoItem label="ติดต่อระหว่างลา" value={leave.contact} />
          <div className="sm:col-span-2 lg:col-span-3">
            <InfoItem label="เหตุผลการลา" value={leave.reason} />
          </div>

          {files.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs text-slate-400">ไฟล์แนบ</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {files.map((f) => (
                  <a
                    key={f.id}
                    href={f.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-brand-700 hover:bg-brand-50"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{f.name || "ไฟล์แนบ"}</span>
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {priorSteps.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs text-slate-400">ความเห็นจากผู้พิจารณาก่อนหน้า</p>
            <ul className="space-y-1.5">
              {priorSteps.map((s) => (
                <li key={s.id ?? s.stepOrder} className="text-sm">
                  <span className="font-medium text-slate-700">
                    {POSITION_BY_STEP[Number(s.stepOrder)] || `ขั้นที่ ${s.stepOrder}`}
                  </span>
                  <span className="text-slate-500">
                    {" "}— {personName(s.approver) || "-"}
                    {s.reviewedAt ? ` (${formatDate(s.reviewedAt)})` : ""}
                  </span>
                  {s.status === "REJECTED" && (
                    <span className="ml-1 rounded bg-rose-50 px-1.5 text-[11px] text-rose-700">ปฏิเสธ</span>
                  )}
                  {s.comment && (
                    <p className="mt-0.5 pl-3 text-xs text-slate-500 border-l-2 border-slate-200">
                      {s.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detail?.error && (
          <p className="mt-3 text-xs text-rose-600">
            โหลดข้อมูลเพิ่มเติมไม่สำเร็จ — ข้อมูลด้านบนเป็นข้อมูลจากรายการ
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          {showComment && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-500" htmlFor={`comment-${leave.id}`}>
                ความคิดเห็น (ไม่บังคับ)
              </label>
              <textarea
                id={`comment-${leave.id}`}
                rows={2}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="ความคิดเห็น/หมายเหตุถึงผู้อนุมัติถัดไป — เว้นว่างได้ ระบบจะใส่ข้อความมาตรฐานให้"
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onOpenFull}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              เปิดหน้ารายละเอียดเต็ม
            </button>
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                disabled={busy || !canAct}
                className={`flex-1 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition sm:flex-none ${
                  busy || !canAct ? "cursor-not-allowed bg-emerald-300" : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {busy ? "กำลังดำเนินการ..." : approveLabel}
              </button>
              <button
                onClick={onReject}
                disabled={busy || !canAct}
                className={`flex-1 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition sm:flex-none ${
                  busy || !canAct ? "cursor-not-allowed bg-rose-300" : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {rejectLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  const display = value === null || value === undefined || value === "" ? "-" : value;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-slate-800">{display}</dd>
    </div>
  );
}

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

DetailCard.propTypes = {
  leave: PropTypes.object.isRequired,
  detail: PropTypes.object,
  dateRange: PropTypes.string.isRequired,
  dayCount: PropTypes.number,
  formatDate: PropTypes.func.isRequired,
  showComment: PropTypes.bool,
  comment: PropTypes.string,
  onCommentChange: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  canAct: PropTypes.bool,
  approveLabel: PropTypes.string.isRequired,
  rejectLabel: PropTypes.string.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onOpenFull: PropTypes.func.isRequired,
};

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
