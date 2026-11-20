/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../../utils/alert";
import { apiEndpoints } from "../../utils/api";
import { useGoBack } from "../../utils/useGoBack";
import { FaUserAlt, FaHistory } from "react-icons/fa";
import AuditTrailModal from "../../components/AuditTrailModal";
import dayjs from "dayjs";
import "dayjs/locale/th";
import ProfileImage from "../../components/ProfileImage";
import {
  formatLeaveDaysByUnit,
  leaveUnitForMaxDays,
} from "../../utils/formatLeaveDays";
import LoadingSpinner from "../../components/LoadingSpinner";
import LeaveSubmissionBadge from "../../components/common/LeaveSubmissionBadge";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);
const balanceInputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const ROLE_LABEL_TH = {
  USER: "ผู้ใช้งานทั่วไป",
  ADMIN: "ผู้ดูแลระบบ",
  SUPER_ADMIN: "ผู้ดูแลระดับสูง",
  APPROVER_1: "หัวหน้าสาขา",
  APPROVER_2: "สารบรรณคณะ",
  APPROVER_3: "หัวหน้าสำนักงานคณบดี",
  APPROVER_4: "รองคณบดีฝ่ายบริหาร",
  APPROVER_5: "คณบดี",
};

export default function UserInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  // ปุ่มย้อนกลับ: ถอยไปหน้าก่อน ถ้าไม่มีประวัติให้ไปหน้าจัดการผู้ใช้งาน
  const goBack = useGoBack("/admin/manage-user");
  const [showAudit, setShowAudit] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({
    rankId: "",
    remainingDays: "",
    usedDays: "",
  });
  const [balanceSaving, setBalanceSaving] = useState(false);
  const currentUserRanks = user?.userRanks || [];

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => {
          window.location.href = "/login";
        }
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiEndpoints.userInfoById(id), authHeader());
      setUser(res.data.user);
    } catch (err) {
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const res = await axios.get(
        apiEndpoints.getLeaveByUserId(id),
        authHeader()
      );
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.leaveRequests || [];
      console.log("Leave Requests:", data);
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(
        // ต้องใช้ประเภทลาทั้งหมด ไม่ใช่เฉพาะที่ผู้ใช้ยื่นเองได้
        // ไม่งั้นใบลาประเภทที่แอดมินยื่นให้จะไม่มีชื่อประเภท
        apiEndpoints.getAllLeaveTypes,
        authHeader()
      );
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
    loadUser();
    loadLeaveRequests();
    fetchLeaveTypes();
  }, [id]);

  const formatDate = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");

  const openBalanceEditor = (balance) => {
    const rankOptions = currentUserRanks
      .map((userRank) => userRank.rank)
      .filter(
        (rank) =>
          rank?.leaveTypeId === balance.leaveTypeId &&
          rank.maxDays !== null &&
          rank.maxDays !== undefined,
      );
    setEditingBalance(balance);
    setBalanceForm({
      rankId: rankOptions.length === 1 ? String(rankOptions[0].id) : "",
      remainingDays: String(
        balance.leaveType?.isNonDeductible ? 0 : balance.remainingDays ?? 0,
      ),
      usedDays: String(balance.usedDays ?? 0),
    });
  };

  const selectedBalanceRank = currentUserRanks
    .map((userRank) => userRank.rank)
    .find((rank) => String(rank?.id) === String(balanceForm.rankId));
  const editingBalanceIsNonDeductible =
    editingBalance?.leaveType?.isNonDeductible === true ||
    (selectedBalanceRank?.receiveDays === 0 &&
      selectedBalanceRank?.isBalance === true);
  const editingBalanceRankOptions = currentUserRanks
    .map((userRank) => userRank.rank)
    .filter(
      (rank) =>
        rank?.leaveTypeId === editingBalance?.leaveTypeId &&
        rank.maxDays !== null &&
        rank.maxDays !== undefined,
    );

  const handleSaveBalance = async (event) => {
    event.preventDefault();
    if (!editingBalance || !balanceForm.rankId) {
      await Swal.fire(
        "ไม่พบ Rank",
        "ไม่สามารถแก้ไขยอดได้หากไม่พบสิทธิ์ Rank ที่ตรงกับประเภทลา",
        "warning",
      );
      return;
    }

    const remainingDays = editingBalanceIsNonDeductible
      ? 0
      : Number(balanceForm.remainingDays);
    const usedDays = Number(balanceForm.usedDays);
    if (
      !Number.isSafeInteger(remainingDays) ||
      remainingDays < 0 ||
      !Number.isSafeInteger(usedDays) ||
      usedDays < 0
    ) {
      await Swal.fire(
        "จำนวนวันไม่ถูกต้อง",
        "กรอกจำนวนวันเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป",
        "warning",
      );
      return;
    }

    const confirmation = await Swal.fire({
      title: "ยืนยันแก้ไขยอดวันลา?",
      text: `ประเภทลา: ${editingBalance.leaveType?.name || ""}\nปีงบประมาณ: ${editingBalance.year}\nคงเหลือ: ${remainingDays} วัน · ใช้ไปแล้ว: ${usedDays} วัน\nระบบจะตรวจสอบสิทธิ์ Rank และยอดรออนุมัติก่อนบันทึก`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันแก้ไข",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#b45309",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      setBalanceSaving(true);
      await axios.put(
        apiEndpoints.adminLeaveBalanceAdjust(editingBalance.id),
        {
          rankId: Number(balanceForm.rankId),
          remainingDays,
          usedDays,
        },
        authHeader(),
      );
      setEditingBalance(null);
      await loadUser();
      await Swal.fire("บันทึกสำเร็จ", "อัปเดตยอดวันลาเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("ไม่สามารถแก้ไขยอดวันลา:", error);
      await Swal.fire(
        "แก้ไขไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถแก้ไขยอดวันลาได้",
        "error",
      );
    } finally {
      setBalanceSaving(false);
    }
  };

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
      "bg-slate-100 text-slate-700 border border-slate-300",
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูลผู้ใช้งาน..." fullScreen={false} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center font-kanit text-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-rose-200 shadow-sm p-6 text-center">
          <p className="text-rose-600 font-medium">ไม่พบข้อมูลผู้ใช้งาน</p>
          <button
            type="button"
            onClick={goBack}
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700"
          >
            ← ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  // ยอดวันลา: แสดงเฉพาะปีงบประมาณล่าสุด
  const balanceYears = (user.leaveBalances || []).map((b) => b.year);
  const latestYear = balanceYears.length ? Math.max(...balanceYears) : null;
  const currentBalances = (user.leaveBalances || []).filter(
    (b) => b.year === latestYear
  );
  const leaveName = (b) =>
    b.leaveType?.name || leaveTypesMap[b.leaveTypeId] || `ประเภท #${b.leaveTypeId}`;
  // แยกหมวด: ประเภทหักวันลาปกติ vs ประเภทไม่จำกัดสิทธิ์ (เก็บวันที่ลาไปแล้ว)
  const deductibleBalances = currentBalances.filter(
    (b) => !b.leaveType?.isNonDeductible
  );
  const nonDeductibleBalances = currentBalances.filter(
    (b) => b.leaveType?.isNonDeductible === true
  );

  // จำนวนครั้งที่ลาจริง (ไม่นับที่ถูกปฏิเสธ/ยกเลิก) แยกตามประเภท เฉพาะปีงบประมาณล่าสุด
  // เพื่อให้ "กี่ครั้ง" สอดคล้องกับยอด "ใช้ไป (วัน)" ของปีเดียวกัน
  const fiscalYearOf = (d) => {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return null;
    return x.getMonth() >= 9 ? x.getFullYear() + 1 : x.getFullYear();
  };
  const timesByType = {};
  for (const lr of leaveRequests) {
    const st = (lr.status || "").toUpperCase();
    if (st === "REJECTED" || st === "CANCELLED") continue;
    if (latestYear && fiscalYearOf(lr.startDate) !== latestYear) continue;
    timesByType[lr.leaveTypeId] = (timesByType[lr.leaveTypeId] || 0) + 1;
  }
  // เรียงให้ประเภทหักวันลาปกติขึ้นก่อน แล้วประเภทไม่หักวันลาไว้ล่างสุด
  const userRanks = [...currentUserRanks].sort((a, b) => {
    const an = a.rank?.leaveType?.isNonDeductible ? 1 : 0;
    const bn = b.rank?.leaveType?.isNonDeductible ? 1 : 0;
    return an - bn;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← กลับหน้าก่อน
          </button>
        </div>
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-700">
              Admin View
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <FaUserAlt className="text-lg" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                โปรไฟล์ผู้ใช้งาน
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                ดูรายละเอียดบัญชีและประวัติการลาของผู้ใช้งาน
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Panel className="p-6 sm:p-8">
          <div className="flex justify-center mb-8">
            <ProfileImage 
                profilePicturePath={user?.profilePicturePath} 
                googleProfilePictureUrl={user?.accounts?.find(acc => acc.provider === 'google')?.profilePictureUrl}
                size="medium"
                className="border-4 border-slate-200 shadow-md"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              [
                "ชื่อ-นามสกุล",
                `${user.prefixName ?? ""}${user.firstName ?? ""} ${
                  user.lastName ?? ""
                }`,
              ],
              ["อีเมล", user.email],
              ["เพศ", user.sex || "-"],
              ["เบอร์มือถือ", user.phone || "-"],
              [
                "คณะ",
                user.organization?.name ||
                  user.department?.organization?.name ||
                  "-",
              ],
              ["สาขา", user.department?.name || "-"],
              ["ประเภทบุคลากร", user.personnelType?.name || "-"],
              ["ตำแหน่งงาน", user.position || "-"],
              [
                "เลขที่ตำแหน่ง",
                user.positionNumbers?.[0]?.positionNumber || "-",
              ],
              [
                "สายงาน",
                user.employmentType === "SUPPORT"
                  ? "สายสนับสนุน"
                  : user.employmentType === "ACADEMIC"
                  ? "สายวิชาการ"
                  : "ไม่มีข้อมูล",
              ],
              [
                "ปีที่เริ่มงาน",
                user.hireDate
                  ? new Date(user.hireDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-",
              ],
            ].map(([label, value], idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  {label}
                </label>
                <p className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-900">
                  {value || "-"}
                </p>
              </div>
            ))}
          </div>

          {/* Roles Section */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-1 mb-3">
              <div className="text-sm font-medium text-slate-800">บทบาท (Roles)</div>
              <div className="text-xs text-slate-600">
                บทบาทที่ผู้ใช้งานได้รับมอบหมายในระบบ
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const roleNames = (user.userRoles || [])
                  .map((ur) => ur.role?.name || ur.roleName)
                  .filter(Boolean);
                const display = roleNames.length > 1
                  ? roleNames.filter((r) => r !== "USER")
                  : roleNames;
                if (!display.length) return <span className="text-sm text-slate-400">ไม่มีบทบาทที่กำหนด</span>;
                const colorMap = {
                  SUPER_ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
                  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
                  APPROVER_5: "bg-violet-50 text-violet-700 border-violet-200",
                  APPROVER_4: "bg-violet-50 text-violet-700 border-violet-200",
                  APPROVER_3: "bg-violet-50 text-violet-700 border-violet-200",
                  APPROVER_2: "bg-violet-50 text-violet-700 border-violet-200",
                  APPROVER_1: "bg-violet-50 text-violet-700 border-violet-200",
                  USER: "bg-slate-50 text-slate-600 border-slate-200",
                };
                return display.map((r) => {
                  const label = ROLE_LABEL_TH[r];
                  return (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${colorMap[r] || "bg-brand-50 text-brand-700 border-brand-200"}`}
                    >
                      {label ? `${label} (${r})` : r}
                    </span>
                  );
                });
              })()}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowAudit(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
              >
                <FaHistory className="h-3.5 w-3.5 text-slate-400" />
                ประวัติการทำงาน
              </button>
              <Link
                to={`/admin/user/${id}`}
                className="inline-block px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition"
              >
                แก้ไขข้อมูลผู้ใช้
              </Link>
            </div>
          </div>
        </Panel>

        {/* Leave Balance */}
        <Panel className="p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              ยอดวันลาคงเหลือ
            </h2>
            {latestYear && (
              <span className="text-sm text-slate-500">
                ปีงบประมาณ {latestYear}
              </span>
            )}
          </div>

          {/* หมวด 1: ประเภทการลาปกติ (หักวันลา) */}
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            ประเภทการลาปกติ
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white mb-7">
            <table className="w-full text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    สิทธิ์ทั้งหมด
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ใช้ไป
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ครั้งที่ลา
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    รออนุมัติ
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    คงเหลือ
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {deductibleBalances.length > 0 ? (
                  deductibleBalances.map((b, idx) => {
                    const unit = leaveUnitForMaxDays(b.maxDays);
                    return (
                    <tr
                      key={b.id ?? idx}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      }`}
                    >
                      <td className="px-4 py-3">{leaveName(b)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {formatLeaveDaysByUnit(b.maxDays, unit)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {formatLeaveDaysByUnit(b.usedDays, unit)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                        {timesByType[b.leaveTypeId] || 0} ครั้ง
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-amber-600">
                        {formatLeaveDaysByUnit(b.pendingDays, unit)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-emerald-700">
                        {formatLeaveDaysByUnit(b.remainingDays, unit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openBalanceEditor(b)}
                          className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                        >
                          แก้ไขยอด
                        </button>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* หมวด 2: ประเภทการลาไม่จำกัดสิทธิ์ (เก็บวันที่ลาไปแล้ว) */}
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-700">
              ประเภทการลาไม่จำกัดสิทธิ์
            </h3>
            <span className="text-[11px] text-slate-400">
              (บันทึกเป็นจำนวนวันที่ลาไปแล้ว ไม่หักยอด)
            </span>
          </div>
          {nonDeductibleBalances.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {nonDeductibleBalances.map((b, idx) => (
                <div
                  key={b.id ?? idx}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60"
                >
                  <span className="text-sm text-slate-700">{leaveName(b)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      ลาไปแล้ว{" "}
                      <span className="font-semibold text-slate-800">
                        {formatLeaveDaysByUnit(b.usedDays, leaveUnitForMaxDays(b.maxDays))}
                      </span>{" "}
                      ({timesByType[b.leaveTypeId] || 0} ครั้ง)
                    </span>
                    <button
                      type="button"
                      onClick={() => openBalanceEditor(b)}
                      className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      แก้ไข
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 px-1">ไม่มีข้อมูล</p>
          )}
        </Panel>

        {/* Rank / Seniority entitlements */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-1 text-slate-900">
            ระดับสิทธิ์ตามอาวุโส (Rank)
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            สิทธิ์การลาที่ผู้ใช้ได้รับตามระดับ/อายุงาน ใช้เป็นฐานในการคำนวณยอดวันลา
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ได้รับ/ปี
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] font-semibold">
                    สะสมสูงสุด
                  </th>
                </tr>
              </thead>
              <tbody>
                {userRanks.length > 0 ? (
                  userRanks.map((ur, idx) => {
                    const lt = ur.rank?.leaveType;
                    const nonDeductible = lt?.isNonDeductible === true;
                    return (
                      <tr
                        key={ur.id ?? idx}
                        className={`border-t border-slate-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {lt?.name || "-"}
                          </div>
                          {ur.rank?.rank && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {ur.rank.rank}
                            </div>
                          )}
                        </td>
                        {nonDeductible ? (
                          <td
                            colSpan="2"
                            className="px-4 py-3 text-right text-sm text-slate-500"
                          >
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-500">
                              ไม่หักวันลา
                            </span>
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {formatLeaveDaysByUnit(
                                ur.rank?.receiveDays,
                                leaveUnitForMaxDays(ur.rank?.maxDays),
                              )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                              {formatLeaveDaysByUnit(
                                ur.rank?.maxDays,
                                leaveUnitForMaxDays(ur.rank?.maxDays),
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ไม่มีข้อมูลระดับสิทธิ์
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Leave History */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-slate-900">
            ประวัติการลา
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm text-slate-900 border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันที่ยื่น
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภทการลา
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ผู้ยื่น
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันเริ่มต้น
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    วันสิ้นสุด
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave, idx) => {
                    const statusKey = (leave.status || "").toUpperCase();
                    return (
                      <tr
                        key={leave.id}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-brand-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                        onClick={() => navigate(`/leave/${leave.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {leave.leaveType?.name || leaveTypesMap[leave.leaveTypeId] || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <LeaveSubmissionBadge leave={leave} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(leave.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[statusKey] ||
                              "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            {statusLabels[statusKey] || leave.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {showAudit && (
        <AuditTrailModal
          title="ประวัติการทำงานของผู้ใช้"
          subtitle={`${user.prefixName ?? ""}${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
          url={`/admin/audit-logs/user/${id}`}
          onClose={() => setShowAudit(false)}
        />
      )}
      {editingBalance && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !balanceSaving) {
              setEditingBalance(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-leave-balance-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="edit-leave-balance-title" className="text-xl font-semibold">
              แก้ไขยอดวันลา: {editingBalance.leaveType?.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              ปีงบประมาณ {editingBalance.year} · ยอดรออนุมัติ{" "}
              {editingBalance.pendingDays ?? 0} วัน
            </p>
            <form onSubmit={handleSaveBalance} className="mt-5 space-y-4">
              {editingBalanceRankOptions.length > 1 && (
                <label className="block text-sm font-medium">
                  Rank ที่ใช้ตรวจสิทธิ์
                  <select
                    required
                    value={balanceForm.rankId}
                    onChange={(event) =>
                      setBalanceForm((previous) => ({
                        ...previous,
                        rankId: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  >
                    <option value="">-- เลือก Rank --</option>
                    {editingBalanceRankOptions.map((rank) => (
                      <option key={rank.id} value={rank.id}>
                        {rank.rank} · สิทธิ์สูงสุด {rank.maxDays} วัน
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {selectedBalanceRank && !editingBalanceIsNonDeductible && (
                <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
                  สิทธิ์สูงสุดตาม Rank: {selectedBalanceRank.maxDays} วัน
                  (รวมยอดรออนุมัติแล้ว)
                </p>
              )}
              {editingBalanceIsNonDeductible ? (
                <>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    ประเภทนี้นับวันที่ใช้ไปแล้วโดยไม่หักยอดคงเหลือ ยอดคงเหลือจะเป็น 0 วัน
                  </p>
                  <label className="block text-sm font-medium">
                    วันที่ใช้ไปแล้ว
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={balanceForm.usedDays}
                      onChange={(event) =>
                        setBalanceForm((previous) => ({
                          ...previous,
                          usedDays: event.target.value,
                        }))
                      }
                      className={balanceInputClass}
                      style={{ colorScheme: "light" }}
                    />
                  </label>
                </>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    วันลาคงเหลือ
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={balanceForm.remainingDays}
                      onChange={(event) =>
                        setBalanceForm((previous) => ({
                          ...previous,
                          remainingDays: event.target.value,
                        }))
                      }
                      className={balanceInputClass}
                      style={{ colorScheme: "light" }}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    วันที่ใช้ไปแล้ว
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={balanceForm.usedDays}
                      onChange={(event) =>
                        setBalanceForm((previous) => ({
                          ...previous,
                          usedDays: event.target.value,
                        }))
                      }
                      className={balanceInputClass}
                      style={{ colorScheme: "light" }}
                    />
                  </label>
                </div>
              )}
              <p className="text-xs text-slate-500">
                ค่าคงเหลือ + ใช้ไปแล้ว + รออนุมัติ ต้องไม่เกินสิทธิ์ตาม Rank
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={balanceSaving}
                  onClick={() => setEditingBalance(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={balanceSaving || !balanceForm.rankId}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {balanceSaving ? "กำลังบันทึก..." : "บันทึกยอด"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
