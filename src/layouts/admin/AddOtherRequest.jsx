import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import Swal from "../../utils/alert";
import { API, apiEndpoints } from "../../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import {
  ChevronDown,
  PlusCircle,
  X,
  Clock,
  Ban,
  Info,
  ExternalLink,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  RotateCcw,
  CheckCircle2,
  Hourglass,
  FileStack,
  CalendarClock,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import thLocale from "@fullcalendar/core/locales/th";
import {
  filterLeaveBalancesLatestYear,
  filterLeaveTypesMapBySex,
  isFemaleOnlyLeaveTypeName,
  isMaleOnlyLeaveTypeName,
  resolveUserSex,
} from "../../utils/leavePolicy";
import { expandHolidays, defaultHolidayYears } from "../../utils/holidayUtils";
import LeaveCancellationModal from "../../components/admin/LeaveCancellationModal";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
const PAGE_SIZE = 10;

const statusLabels = {
  APPROVED: "อนุมัติแล้ว",
  PENDING: "รอดำเนินการ",
  REJECTED: "ถูกปฏิเสธ",
  CANCELLED: "ยกเลิกแล้ว",
};

const statusColors = {
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border border-slate-200",
};

function LeaveRequestModalAdmin({ leaveTypesMap = {}, onClose, onSuccess }) {
  const [prefixName, setPrefixName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentIssuedDate, setDocumentIssuedDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");

  const [holidays, setHolidays] = useState([]);
  const [holidayLoaded, setHolidayLoaded] = useState(false);
  const [holidayLoadError, setHolidayLoadError] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);

  const [useApprovalDetails, setUseApprovalDetails] = useState(true);
  const [approvalDetailsForm, setApprovalDetailsForm] = useState({
    1: { reviewedAt: "", comment: "", remarks: "" },
    2: { reviewedAt: "", comment: "", remarks: "" },
    4: { reviewedAt: "", comment: "", remarks: "" },
    5: { reviewedAt: "", comment: "", remarks: "" },
    6: { reviewedAt: "", comment: "", remarks: "" },
  });

  const [approverOwners, setApproverOwners] = useState({});

  const [userLand, setUserLand] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const hasFetched = useRef(false);
  const debounceRef = useRef(null);

  const inputStyle =
    "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

  const normalizeUsers = (payload) => {
    const arr = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.user)
      ? payload.user
      : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload)
      ? payload
      : [];

    const splitFullName = (fullName) => {
      const raw = String(fullName || "").trim().replace(/\s+/g, " ");
      if (!raw) return { firstName: "", lastName: "" };
      const parts = raw.split(" ");
      if (parts.length === 1) return { firstName: parts[0], lastName: "" };
      return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
    };

    return arr
      .map((u) => ({
        id: u.id ?? u.userId ?? null,
        prefixName: u.prefixName ?? u.prefix ?? "",
        ...(u.firstName || u.lastName
          ? { firstName: u.firstName ?? "", lastName: u.lastName ?? "" }
          : splitFullName(u.fullName ?? u.displayName ?? u.name)),
      }))
      .filter((u) => u.id != null);
  };

  const fetchUserLand = useCallback(async () => {
    try {
      // const token = localStorage.getItem("accessToken");
      const res = await API.get(apiEndpoints.userLanding);
      const list = normalizeUsers(res?.data);
      setUserLand(list);
    } catch (err) {
      console.error("Error fetching user land:", err);
      setUserLand([]);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchUserLand();
  }, [fetchUserLand]);

  const fullQuery = `${prefixName} ${firstName} ${lastName}`.trim();

  useEffect(() => {
    if (documentIssuedDate) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDocumentIssuedDate(`${yyyy}-${mm}-${dd}`);
  }, [documentIssuedDate]);

  useEffect(() => {
    if (!documentIssuedDate) return;
    setApprovalDetailsForm((prev) => {
      const next = { ...prev };
      [1, 2, 4, 5, 6].forEach((s) => {
        if (!next?.[s]?.reviewedAt) {
          next[s] = { ...(next[s] || {}), reviewedAt: documentIssuedDate };
        }
      });
      return next;
    });
  }, [documentIssuedDate]);

  const STEP_LABELS = {
    1: "หัวหน้าสาขา (Approver 1)",
    2: "ผู้ตรวจสอบ (Verifier)",
    4: "สรรบรรณคณะ (Approver 2)",
    5: "รองคณบดี (Approver 3)",
    6: "คณบดี (Approver 4)",
  };

  const formatUserName = (u) => {
    if (!u) return "";
    return [u.prefixName, u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  };

  const renderStepHeader = (stepOrder) => {
    const base = STEP_LABELS[stepOrder] || `step ${stepOrder}`;
    const owner = approverOwners?.[stepOrder];
    const name = formatUserName(owner);

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-800 ring-1 ring-slate-200">
          {base}
        </span>
        {name ? (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-medium text-brand-800 ring-1 ring-brand-200">
            {name}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-500 ring-1 ring-slate-200">
            ไม่พบผู้ดำรงตำแหน่ง
          </span>
        )}
      </div>
    );
  };

  const updateApprovalField = (stepOrder, field, value) => {
    setApprovalDetailsForm((prev) => ({
      ...prev,
      [stepOrder]: {
        ...(prev?.[stepOrder] || { reviewedAt: "", comment: "", remarks: "" }),
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const userId = selectedUser?.id;
    if (!userId) {
      setApproverOwners({});
      return;
    }

    const adminBase = String(apiEndpoints.getHoliday || "").replace(/\/admin\/holiday$/, "");
    const url = `${adminBase}/admin/leave-requests/approvers/${userId}`;

    let cancelled = false;
    (async () => {
      try {
        const res = await API.get(url);
        const steps = res?.data?.data;
        if (!Array.isArray(steps)) return;
        const next = {};
        steps.forEach((s) => {
          const stepOrder = Number(s?.stepOrder);
          if (!stepOrder) return;
          next[stepOrder] = s?.user || null;
        });
        if (!cancelled) setApproverOwners(next);
      } catch (err) {
        if (!cancelled) setApproverOwners({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    const userId = selectedUser?.id;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await API.get(apiEndpoints.userInfoById(userId));
        const u = res?.data?.data ?? res?.data?.user ?? res?.data ?? null;
        const sex = u?.sex;
        if (cancelled) return;
        if (!sex) return;
        setSelectedUser((prev) => {
          if (!prev) return prev;
          if (prev.sex === sex) return prev;
          return { ...prev, sex };
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setHolidayLoaded(false);
        setHolidayLoadError(null);
        const res = await API.get(apiEndpoints.getHoliday);
        const dates = Array.isArray(res?.data?.data)
          ? res.data.data
              .map((h) => h?.date)
              .filter(Boolean)
              .map((d) => (dayjs(d).isValid() ? dayjs(d).format("YYYY-MM-DD") : null))
              .filter(Boolean)
          : [];
        if (!cancelled) setHolidays(dates);
      } catch {
        if (!cancelled) {
          setHolidays([]);
          setHolidayLoadError("โหลดข้อมูลวันหยุดไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setHolidayLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const userId = selectedUser?.id;
    if (!userId) {
      setLeaveBalances([]);
      setSelectedLeaveBalance(null);
      return;
    }

    const adminBase = String(apiEndpoints.getHoliday || "").replace(/\/admin\/holiday$/, "");
    const url = `${adminBase}/admin/leave-balances/${userId}`;
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get(url);
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (cancelled) return;
        setLeaveBalances(filterLeaveBalancesLatestYear(list));
      } catch {
        if (!cancelled) setLeaveBalances([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!leaveTypeId) {
      setSelectedLeaveBalance(null);
      return;
    }
    const selected = leaveBalances.find((b) => String(b.leaveTypeId) === String(leaveTypeId));
    setSelectedLeaveBalance(selected || null);
  }, [leaveTypeId, leaveBalances]);

  const userSex = useMemo(() => resolveUserSex(selectedUser), [selectedUser]);

  const leaveTypesMapByUserSex = useMemo(() => {
    return filterLeaveTypesMapBySex(leaveTypesMap, userSex);
  }, [leaveTypesMap, userSex]);

  // เงื่อนไขเพศไม่ตรงกับประเภทการลาที่เลือก (ใช้ทั้งเตือนและบล็อกการบันทึก)
  const sexLeaveConflict = useMemo(() => {
    if (!selectedUser || !leaveTypeId) return null;
    const name = leaveTypesMap?.[leaveTypeId] || "";
    if (userSex === "MALE" && isFemaleOnlyLeaveTypeName(name))
      return { requiredSex: "หญิง", name };
    if (userSex === "FEMALE" && isMaleOnlyLeaveTypeName(name))
      return { requiredSex: "ชาย", name };
    return null;
  }, [selectedUser, leaveTypeId, leaveTypesMap, userSex]);

  const parseYmdOrDmy = useCallback((value) => {
    if (!value) return dayjs.invalid();
    const s = String(value).trim();
    const parsed = dayjs(s, ["YYYY-MM-DD", "DD/MM/YYYY", "D/M/YYYY"], true);
    if (parsed.isValid()) return parsed;
    return dayjs(s);
  }, []);

  const calculateWorkingDays = useCallback(
    (start, end) => {
      const startD = parseYmdOrDmy(start);
      const endD = parseYmdOrDmy(end);
      if (!startD.isValid() || !endD.isValid() || startD.isAfter(endD)) return 0;

      let workingDays = 0;
      let d = startD.clone();
      while (d.isSame(endD, "day") || d.isBefore(endD, "day")) {
        const isWeekend = d.day() === 0 || d.day() === 6;
        const isHoliday = holidays.includes(d.format("YYYY-MM-DD"));
        if (!isWeekend && !isHoliday) workingDays++;
        d = d.add(1, "day");
      }
      return workingDays;
    },
    [holidays, parseYmdOrDmy]
  );

  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate, calculateWorkingDays]);

  const isInvalidDateRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return start.isValid() && end.isValid() && end.isBefore(start, "day");
  }, [startDate, endDate]);

  const dayHighlight = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return "!text-red-500";
    }
    return "";
  };

  useEffect(() => {
    if (!fullQuery) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = fullQuery.toLowerCase().replace(/\s+/g, " ");
      const result = userLand
        .filter((u) => {
          const name = `${u.prefixName} ${u.firstName} ${u.lastName}`
            .toLowerCase()
            .replace(/\s+/g, " ");
          return (
            name.includes(q) ||
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q)
          );
        })
        .slice(0, 10);
      setSuggestions(result);
      if (result.length === 1) setSelectedUser(result[0]);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [fullQuery, userLand]);

  const pickUser = (u) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setPrefixName(u.prefixName || "");
    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    setSelectedUser(u);
    setSuggestions([]);
  };

  const clearPickedUser = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setPrefixName("");
    setFirstName("");
    setLastName("");
    setSelectedUser(null);
    setSuggestions([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!selectedUser?.id) {
        alert("กรุณาเลือกผู้ใช้งานจากรายการค้นหา (Suggestion) ก่อนบันทึก");
        return;
      }
      if (!String(documentNumber || "").trim()) {
        alert("กรุณาระบุเลขที่เอกสาร");
        return;
      }

      if (sexLeaveConflict) {
        await Swal.fire({
          icon: "warning",
          title: "เพศไม่ตรงกับประเภทการลา",
          text: `ประเภทการลา "${sexLeaveConflict.name}" สำหรับเพศ${sexLeaveConflict.requiredSex}เท่านั้น`,
          confirmButtonText: "ตกลง",
        });
        return;
      }

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      if (start.isValid() && end.isValid() && end.isBefore(start, "day")) {
        await Swal.fire({
          icon: "warning",
          title: "วันที่ไม่ถูกต้อง",
          text: "วันที่สิ้นสุด ต้องมากกว่าวันที่เริ่มลา",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      const fd = new FormData();
      fd.append("userId", String(selectedUser.id));
      fd.append("leaveTypeId", String(leaveTypeId));
      if (prefixName) fd.append("prefixName", prefixName);
      if (firstName) fd.append("firstName", firstName);
      if (lastName) fd.append("lastName", lastName);
      fd.append("startDate", startDate);
      fd.append("endDate", endDate);
      fd.append("reason", reason);
      if (contact) fd.append("contact", contact);
      fd.append("documentNumber", String(documentNumber).trim());
      if (documentIssuedDate) fd.append("documentIssuedDate", documentIssuedDate);
      if (imageFile) fd.append("images", imageFile);

      if (useApprovalDetails) {
        const steps = [1, 2, 4, 5, 6];
        const payload = steps.map((s) => {
          const row = approvalDetailsForm?.[s] || {};
          const reviewedAt = String(row.reviewedAt || "").trim();
          const comment = String(row.comment || "").trim();
          const remarks = String(row.remarks || "").trim();
          return {
            stepOrder: s,
            reviewedAt: reviewedAt || null,
            comment: comment || null,
            remarks: remarks || null,
          };
        });
        fd.append("approvalDetails", JSON.stringify(payload));
      }

      // const token = localStorage.getItem("accessToken");
      await API.post(apiEndpoints.adminLeaveRequests, fd, {
        withCredentials: true,
      });
      
      // แสดง Swal.fire แจ้งความสำเร็จ
      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกคำขอการลาสำเร็จแล้ว",
        confirmButtonColor: "#10b981",
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(
        "Submit error:",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      
      // แสดง error message แก่ผู้ใช้
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.message || 
                          "เกิดข้อผิดพลาดในการบันทึกคำขอการลา";
      
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[min(92vw,720px)] max-h-[90vh] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl font-kanit flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Action
            </span>
            <h2 className="text-lg font-semibold">บันทึกคำขอการลา (Admin)</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 relative">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  คำนำหน้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={prefixName}
                  onChange={(e) => setPrefixName(e.target.value)}
                  className={inputStyle}
                  placeholder="นาย/นาง/น.ส."
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  ชื่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputStyle}
                  placeholder="พิมพ์เพื่อค้นหา"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => pickUser(u)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span>{`${u.prefixName ?? ""} ${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()}</span>
                      <span className="text-xs text-slate-500">ID: {u.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <div>
                  ผู้ใช้ที่เลือก:{" "}
                  {`${selectedUser.prefixName ?? ""} ${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim()} (ID: {selectedUser.id})
                </div>
                <button
                  type="button"
                  onClick={clearPickedUser}
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                >
                  ล้างชื่อ
                </button>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  ประเภทการลา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className={inputStyle}
                  required
                >
                  <option value="">-- เลือกประเภทการลา --</option>
                  {Object.entries(leaveTypesMapByUserSex || {}).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  เหตุผล
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={inputStyle}
                />
              </div>

              {/* เตือนเมื่อเพศของผู้ใช้ไม่ตรงกับประเภทการลาที่เลือก (บล็อกการบันทึกด้วย) */}
              {sexLeaveConflict && (
                <div className="sm:col-span-2">
                  <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 border border-rose-200">
                    <span className="font-medium">
                      ⚠️ ประเภทการลานี้สำหรับเพศ{sexLeaveConflict.requiredSex}เท่านั้น
                    </span>
                    <span className="ml-2 text-xs text-rose-600">
                      ({selectedUser.prefixName} {selectedUser.firstName}{" "}
                      {selectedUser.lastName} ไม่สามารถยื่นลาประเภทนี้ได้)
                    </span>
                  </div>
                </div>
              )}

              {(holidayLoadError || selectedLeaveBalance) && (
                <div className="sm:col-span-2">
                  {holidayLoadError ? (
                    <div className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 border border-rose-200">
                      {holidayLoadError} (อาจคำนวณจำนวนวันลาเพี้ยน)
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 border border-slate-200">
                      {(() => {
                        // ตรวจสอบว่าเป็นประเภทการลาที่ไม่ต้องหักวันหรือไม่
                        const nonDeductibleLeaveTypes = [5, 6, 10, 11, 13]; // ลาอุปสมบท, ลาเข้ารับการตรวจเลือก, ลาไปถือศีล, ลาไปปฏิบัติงานในองค์การระหว่างประเทศ, ลาไปประกอบพิธีฮัจย์
                        const isNonDeductible = (selectedLeaveBalance.maxDays === 0 && selectedLeaveBalance.remainingDays === 0) ||
                                               nonDeductibleLeaveTypes.includes(selectedLeaveBalance.leaveType?.id);
                        
                        if (isNonDeductible) {
                          return (
                            <>
                              <span className="font-medium text-emerald-600">📝 ประเภทการลานี้ไม่ต้องหักวันลา</span>
                              <span className="ml-2 text-xs text-slate-500">
                                (เป็นการบันทึกวันที่เท่านั้น)
                              </span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              คุณมีสิทธิลาประเภทนี้เหลือ:{" "}
                              <span className="font-semibold text-slate-900">
                                {selectedLeaveBalance.remainingDays} วัน
                              </span>
                            </>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  วันที่เริ่มลา <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  selected={startDate ? new Date(startDate) : null}
                  onChange={(date) => {
                    const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                    setStartDate(formatted);
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={th}
                  placeholderText="เลือกวันที่เริ่มต้น (วัน/เดือน/ปี)"
                  className={`${inputStyle}`}
                  wrapperClassName="w-full"
                  calendarClassName="!rounded-xl !border-2 !border-rose-300 p-2"
                  dayClassName={dayHighlight}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  วันที่สิ้นสุด <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  selected={endDate ? new Date(endDate) : null}
                  onChange={(date) => {
                    const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                    setEndDate(formatted);
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={th}
                  placeholderText="เลือกวันที่สิ้นสุด (วัน/เดือน/ปี)"
                  className={`${inputStyle}`}
                  wrapperClassName="w-full"
                  calendarClassName="!rounded-xl p-2"
                  dayClassName={dayHighlight}
                  required
                />
              </div>

              {startDate && endDate && (
                <div className="sm:col-span-2">
                  {isInvalidDateRange ? (
                    <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 border border-rose-200">
                      <span className="font-medium">⚠️ กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุดให้ถูกต้อง</span>
                      <span className="ml-2 text-xs text-rose-600">
                        (วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น)
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-200">
                      จำนวนวันลา:{" "}
                      <span className="font-semibold text-slate-900">{workingDays} วัน</span>
                      <span className="ml-2 text-xs text-slate-500">
                        (ไม่นับเสาร์-อาทิตย์ และวันหยุดราชการ)
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  ช่องทางติดต่อ
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  เลขที่เอกสาร <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  วันที่ออกเอกสาร
                </label>
                <input
                  type="date"
                  value={documentIssuedDate}
                  onChange={(e) => setDocumentIssuedDate(e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  แนบรูปภาพ
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-slate-900">
                    ข้อมูลการอนุมัติ (Approval Details) <span className="text-rose-500">*</span>
                  </div>
                  <div className="text-xs text-slate-600">ระบุข้อมูลแยกตามขั้นตอน (ถ้าไม่ระบุ ระบบจะใช้ค่าเริ่มต้น)</div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={useApprovalDetails}
                    onChange={(e) => setUseApprovalDetails(e.target.checked)}
                  />
                  ระบุข้อมูล
                </label>
              </div>

              {useApprovalDetails && (
                <div className="mt-4 space-y-4">
                  {[1, 2, 4, 5, 6].map((stepOrder) => (
                    <div key={stepOrder} className="rounded-xl bg-white border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-slate-900">{renderStepHeader(stepOrder)}</div>
                        <div className="text-xs text-slate-500">stepOrder: {stepOrder}</div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs text-slate-600">วันที่</label>
                          <input
                            type="date"
                            value={approvalDetailsForm?.[stepOrder]?.reviewedAt || ""}
                            onChange={(e) => updateApprovalField(stepOrder, "reviewedAt", e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-slate-600">Comment</label>
                          <input
                            type="text"
                            value={approvalDetailsForm?.[stepOrder]?.comment || ""}
                            onChange={(e) => updateApprovalField(stepOrder, "comment", e.target.value)}
                            className={inputStyle}
                            placeholder="โปรดพิจารณา"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-slate-600">Remarks</label>
                          <input
                            type="text"
                            value={approvalDetailsForm?.[stepOrder]?.remarks || ""}
                            onChange={(e) => updateApprovalField(stepOrder, "remarks", e.target.value)}
                            className={inputStyle}
                            placeholder="อนุมัติ"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-500 disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกคำขอการลา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddOtherRequest() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [accountNameMap, setAccountNameMap] = useState({});
  const [leaveInformationUrl, setLeaveInformationUrl] = useState(null);
  // แท็บย่อยเก็บใน URL (?sub= / ?rsub=) เพื่อให้คงค้างเมื่อกด back กลับมา
  // (เข้าไปดูรายละเอียดใบลาแล้วย้อนกลับ ต้องอยู่แท็บย่อยเดิม) โดยคง ?tab= ของแท็บบนไว้
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("sub") || "overview"; // 'overview' | 'requests' | 'calendar'
  const requestSubTab = searchParams.get("rsub") || "today"; // 'today' | 'all'

  const setActiveTab = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("sub", value);
    if (value !== "requests") next.delete("rsub"); // ออกจากแท็บ "คำขอ" ล้างแท็บย่อยรอง
    setSearchParams(next, { replace: true });
  };

  const setRequestSubTab = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("rsub", value);
    setSearchParams(next, { replace: true });
  };
  const [holidays, setHolidays] = useState([]);

  const fetchAccountNames = async (rows) => {
    // const token = localStorage.getItem("accessToken");
    const ids = Array.from(
      new Set(
        rows
          .map((r) => r.accountId)
          .filter((id) => !!id && !accountNameMap[id])
      )
    );
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) => API.get(apiEndpoints.userInfoById(id)))
    );
    const next = { ...accountNameMap };
    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        const u = res.value.data?.data ?? res.value.data ?? {};
        const name =
          u.fullName ||
          [u.prefixName, u.firstName, u.lastName].filter(Boolean).join(" ") ||
          u.displayName ||
          "";
        if (name) next[ids[idx]] = name;
      }
    });
    setAccountNameMap(next);
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      // const token = localStorage.getItem("accessToken");
      const res = await API.get(apiEndpoints.leaveRequest);
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.leaveRequest || res.data.leaveRequests)
        ? res.data.leaveRequest || res.data.leaveRequests
        : [];
      setLeaveRequest(data);
      fetchAccountNames(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await API.get(apiEndpoints.getAllLeaveTypes);
      const map = {};
      (res.data.data || []).forEach((lt) => {
        map[lt.id] = lt.name;
      });
      setLeaveTypesMap(map);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await API.get(apiEndpoints.getHoliday);
      setHolidays(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  const fetchLeaveInformationUrl = async () => {
    try {
      const res = await API.get(apiEndpoints.getSettingByKey('leave_information'));
      if (res.data?.data?.value) setLeaveInformationUrl(res.data.data.value);
    } catch (err) {
      console.error("ไม่สามารถโหลดลิงก์ข้อมูลการลา:", err);
      // Fallback to hardcoded URL if setting not found
      setLeaveInformationUrl('https://sites.google.com/rmuti.ac.th/hrkkcrmuti/%E0%B8%AA%E0%B8%97%E0%B8%98%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%82%E0%B8%A2%E0%B8%8A%E0%B8%99%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A7%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%A5%E0%B8%B2');
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
    fetchLeaveInformationUrl();
    fetchHolidays();
  }, []);

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

  const getFullName = (r) =>
    accountNameMap[r?.accountId] ||
    r?.account?.fullName ||
    [r?.account?.prefixName, r?.account?.firstName, r?.account?.lastName]
      .filter(Boolean)
      .join(" ") ||
    r?.fullName ||
    r?.requesterName ||
    r?.user?.fullName ||
    [r?.user?.prefixName, r?.user?.firstName, r?.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "-";

  const todayStr = dayjs().format("YYYY-MM-DD");

  const filtered = useMemo(() => {
    const sorted = [...leaveRequest].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted.filter((lr) => {
      const created = dayjs(lr.createdAt).format("YYYY-MM-DD");

      // แท็บย่อย "วันนี้" = คำขอที่ยื่นวันนี้ (createdAt = วันนี้)
      if (requestSubTab === "today" && created !== todayStr) return false;

      let byDate = true;
      // ช่วงวันที่ใช้เฉพาะแท็บ "ทั้งหมด/ประวัติ"
      if (requestSubTab === "all") {
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
      }
      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType
        ? String(lr.leaveTypeId) === filterLeaveType
        : true;
      return byDate && byStatus && byType;
    });
  }, [
    leaveRequest,
    requestSubTab,
    todayStr,
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterLeaveType,
    sortOrder,
  ]);

  // สถิติภาพรวมสำหรับแท็บ "ภาพรวม"
  const stats = useMemo(() => {
    const result = {
      total: leaveRequest.length,
      today: 0,
      pending: 0,
      approved: 0,
      cancelled: 0,
      onLeaveToday: 0,
    };
    leaveRequest.forEach((r) => {
      const created = dayjs(r.createdAt).format("YYYY-MM-DD");
      if (created === todayStr) result.today += 1;
      if (r.status === "PENDING") result.pending += 1;
      if (r.status === "APPROVED") result.approved += 1;
      if (r.status === "CANCELLED") result.cancelled += 1;
      // กำลังลาวันนี้ (อนุมัติแล้ว และวันนี้อยู่ในช่วงวันลา)
      const s = dayjs(r.startDate).format("YYYY-MM-DD");
      const e = dayjs(r.endDate).format("YYYY-MM-DD");
      if (r.status === "APPROVED" && s <= todayStr && todayStr <= e) {
        result.onLeaveToday += 1;
      }
    });
    return result;
  }, [leaveRequest, todayStr]);

  // อีเวนต์ปฏิทิน: วันหยุด + คำขอลาทั้งหมด (ไม่รวมที่ยกเลิก/ปฏิเสธ)
  const calendarEvents = useMemo(() => {
    const holidayEvents = expandHolidays(holidays, defaultHolidayYears()).map(
      (h) => ({
        title: h.description,
        start: h._date,
        allDay: true,
        color: "#ef4444",
        extendedProps: { kind: "holiday", holidayType: h.holidayType },
      })
    );

    const statusColorMap = {
      APPROVED: "#10b981",
      PENDING: "#f59e0b",
      REJECTED: "#f43f5e",
      CANCELLED: "#94a3b8",
    };

    const leaveEvents = leaveRequest
      .filter((r) => r.status !== "CANCELLED" && r.status !== "REJECTED")
      .map((r) => {
        const name = getFullName(r);
        const shortName = String(name).split(" ").slice(0, 2).join(" ");
        const typeName = leaveTypesMap[r.leaveTypeId] || r?.leaveType?.name || "ลา";
        return {
          title: `${shortName} | ${typeName}`,
          start: dayjs(r.startDate).format("YYYY-MM-DD"),
          end: dayjs(r.endDate).add(1, "day").format("YYYY-MM-DD"),
          allDay: true,
          color: statusColorMap[r.status] || "#3b82f6",
          extendedProps: {
            kind: "leave",
            leaveId: r.id,
            status: r.status,
          },
        };
      });

    return [...holidayEvents, ...leaveEvents];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidays, leaveRequest, leaveTypesMap, accountNameMap]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [requestSubTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterStatus("");
    setFilterLeaveType("");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  if (loading && leaveRequest.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 text-slate-800 font-kanit rounded-2xl">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg px-8 py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_14px_rgba(122,27,34,0.6)]" />
            </div>
            <div>
              <span className="text-slate-800 font-medium block">กำลังโหลดข้อมูลการลา...</span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "ภาพรวม", icon: LayoutDashboard },
    { key: "requests", label: "คำขอลา", icon: ClipboardList },
    { key: "calendar", label: "ปฏิทิน", icon: CalendarDays },
  ];

  const statCards = [
    {
      key: "total",
      label: "คำขอทั้งหมด",
      value: stats.total,
      icon: FileStack,
      tone: "text-slate-700 bg-slate-100",
    },
    {
      key: "today",
      label: "ยื่นวันนี้",
      value: stats.today,
      icon: CalendarClock,
      tone: "text-brand-700 bg-brand-50",
    },
    {
      key: "pending",
      label: "รอดำเนินการ",
      value: stats.pending,
      icon: Hourglass,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      key: "approved",
      label: "อนุมัติแล้ว",
      value: stats.approved,
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="font-kanit text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start md:text-left">
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                บันทึกคำขอการลาลงระบบ
              </h1>
              <p className="text-sm text-slate-600">
                บันทึก / ยกเลิกคำขอแทนผู้ใช้ และดูภาพรวมการลาทั้งระบบ
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-500 whitespace-nowrap"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                บันทึกคำขอใหม่
              </button>
              <button
                onClick={() => setCancelModalOpen(true)}
                className="flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-500 whitespace-nowrap"
              >
                <Ban className="mr-2 h-4 w-4" />
                ยกเลิกคำขอลา
              </button>
            </div>
          </div>
        </div>

        {/* Page Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <div className="flex gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================== แท็บ: ภาพรวม ===================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-3"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-2xl font-semibold text-slate-900 leading-tight">
                        {c.value}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {c.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* กำลังลาวันนี้ */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 shadow-sm flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm text-slate-600">บุคลากรที่กำลังลาวันนี้</div>
                <div className="text-xl font-semibold text-emerald-700">
                  {stats.onLeaveToday} คน
                </div>
              </div>
              <button
                onClick={() => setActiveTab("calendar")}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-white transition-colors"
              >
                <CalendarDays className="h-4 w-4" />
                ดูปฏิทิน
              </button>
            </div>

            {/* Leave Information Panel */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    ข้อมูลสิทธิประโยชน์และเงื่อนไขการลา
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    ตรวจสอบข้อมูลละเอียดเกี่ยวกับสิทธิประโยชน์การลาต่างๆ เงื่อนไขการพิจารณา และวิธีการดำเนินการตามประเภทการลาที่สามารถลาได้
                  </p>
                  <a
                    href={leaveInformationUrl || 'https://sites.google.com/rmuti.ac.th/hrkkcrmuti/%E0%B8%AA%E0%B8%97%E0%B8%98%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%82%E0%B8%A2%E0%B8%8A%E0%B8%99%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A7%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%A5%E0%B8%B2'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm hover:shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ดูข้อมูลการลาฉบับสมบูรณ์
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== แท็บ: คำขอลา ===================== */}
        {activeTab === "requests" && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
            {/* Sub-tabs: วันนี้ / ทั้งหมด */}
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setRequestSubTab("today")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    requestSubTab === "today"
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => setRequestSubTab("all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    requestSubTab === "all"
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ทั้งหมด / ประวัติ
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  อนุมัติแล้ว
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  รอดำเนินการ
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  ถูกปฏิเสธ / ยกเลิก
                </span>
              </div>
            </div>

            {/* Filter bar (เฉพาะแท็บ "ทั้งหมด") */}
            {requestSubTab === "all" && (
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600">จาก</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => {
                      setFilterStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <label className="text-xs text-slate-600">ถึง</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => {
                      setFilterEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>

                <div className="relative w-40 md:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="">สถานะทั้งหมด</option>
                    {Object.keys(statusLabels).map((k) => (
                      <option key={k} value={k}>
                        {statusLabels[k]}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="relative w-40 md:w-48">
                  <select
                    value={filterLeaveType}
                    onChange={(e) => {
                      setFilterLeaveType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="">ประเภทการลาทั้งหมด</option>
                    {Object.entries(leaveTypesMap).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="relative w-40 md:w-48">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="desc">เรียงจากใหม่ไปเก่า</option>
                    <option value="asc">เรียงจากเก่าไปใหม่</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs md:text-sm font-medium text-white transition hover:bg-rose-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </button>
              </div>
            )}

            {requestSubTab === "today" && (
              <div className="mb-4 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2 text-xs text-brand-700">
                แสดงเฉพาะคำขอที่ยื่นวันนี้ ({dayjs().locale("th").format("DD/MM/YYYY")}) — ทั้งหมด {filtered.length} รายการ
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm text-slate-900">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                      ชื่อ
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap">
                      วันที่ยื่น
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap">
                      ประเภทการลา
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap">
                      วันที่เริ่มต้น
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap">
                      วันที่สิ้นสุด
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        กำลังโหลดข้อมูลการลา...
                      </td>
                    </tr>
                  ) : displayItems.length > 0 ? (
                    displayItems.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={`border-t border-slate-100 whitespace-nowrap hover:bg-brand-50 cursor-pointer transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                        onClick={() => navigate(`/leave/${r.id}`)}
                      >
                        <td className="px-4 py-3">{getFullName(r)}</td>
                        <td className="px-4 py-3">
                          {formatDateTime(r.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {leaveTypesMap[r.leaveTypeId] || r?.leaveType?.name || "-"}
                        </td>
                        <td className="px-4 py-3">{formatDate(r.startDate)}</td>
                        <td className="px-4 py-3">{formatDate(r.endDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[r.status] ||
                              "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {statusLabels[r.status] || r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-slate-500 text-sm"
                        colSpan={6}
                      >
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
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
                            currentPage === page ? 'z-10 bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
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
        )}

        {/* ===================== แท็บ: ปฏิทิน ===================== */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <div className="efc-modern rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-6">
              <FullCalendar
                plugins={[dayGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                firstDay={0}
                events={calendarEvents}
                height="auto"
                locale={thLocale}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,listMonth",
                }}
                buttonText={{
                  today: "วันนี้",
                  month: "เดือน",
                  list: "รายการ",
                }}
                dayMaxEvents={3}
                eventClick={(info) => {
                  const p = info.event.extendedProps;
                  if (p.kind === "leave" && p.leaveId) {
                    navigate(`/leave/${p.leaveId}`);
                  }
                }}
                eventClassNames="cursor-pointer"
              />
            </div>

            {/* Legend */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                วันหยุดราชการ
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: "#10b981" }} />
                ลา (อนุมัติแล้ว)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                ลา (รอดำเนินการ)
              </span>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <LeaveRequestModalAdmin
          leaveTypesMap={leaveTypesMap}
          onClose={() => setModalOpen(false)}
          onSuccess={() => fetchLeaveRequests()}
        />
      )}

      {isCancelModalOpen && (
        <LeaveCancellationModal
          onClose={() => setCancelModalOpen(false)}
          onSuccess={() => fetchLeaveRequests()}
        />
      )}
    </div>
  );
}
