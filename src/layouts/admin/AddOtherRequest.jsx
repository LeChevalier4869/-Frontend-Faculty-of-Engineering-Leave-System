import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { API, apiEndpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import { Plus, ChevronDown, PlusCircle, X, Clock } from "lucide-react";

dayjs.extend(isBetween);
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

  const [userLand, setUserLand] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const hasFetched = useRef(false);
  const debounceRef = useRef(null);

  const inputStyle =
    "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

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
    return arr
      .map((u) => ({
        id: u.id ?? u.userId ?? null,
        prefixName: u.prefixName ?? u.prefix ?? "",
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
      }))
      .filter((u) => u.id != null);
  };

  const fetchUserLand = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(apiEndpoints.userLanding, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, [fullQuery, userLand]);

  const pickUser = (u) => {
    setPrefixName(u.prefixName || "");
    setFirstName(u.firstName || "");
    setLastName(u.lastName || "");
    setSelectedUser(u);
    setSuggestions([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
      if (documentNumber) fd.append("documentNumber", documentNumber);
      if (documentIssuedDate) fd.append("documentIssuedDate", documentIssuedDate);
      if (imageFile) fd.append("images", imageFile);

      // const token = localStorage.getItem("accessToken");
      await API.post(apiEndpoints.adminLeaveRequests, fd, {
        withCredentials: true,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(
        "Submit error:",
        err?.response?.status,
        err?.response?.data || err?.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-[min(92vw,720px)] max-h-[90vh] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl font-kanit flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700">
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

        <form onSubmit={submit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 relative">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  คำนำหน้า
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
                  ชื่อ
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
                  นามสกุล
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
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                ผู้ใช้ที่เลือก:{" "}
                {`${selectedUser.prefixName ?? ""} ${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim()}{" "}
                (ID: {selectedUser.id})
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  ประเภทการลา
                </label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className={inputStyle}
                  required
                >
                  <option value="">-- เลือกประเภทการลา --</option>
                  {Object.entries(leaveTypesMap || {}).map(([id, name]) => (
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
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  วันที่เริ่มลา
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
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
                  เลขที่เอกสาร
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className={inputStyle}
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
              className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-60"
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
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [accountNameMap, setAccountNameMap] = useState({});

  const fetchAccountNames = async (rows) => {
    const token = localStorage.getItem("accessToken");
    const ids = Array.from(
      new Set(
        rows
          .map((r) => r.accountId)
          .filter((id) => !!id && !accountNameMap[id])
      )
    );
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) =>
        axios.get(apiEndpoints.userInfoById(id), {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    const next = { ...accountNameMap };
    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        const u = res.value.data?.data ?? res.value.data ?? {};
        const name =
          u.fullName ||
          [u.firstName, u.lastName].filter(Boolean).join(" ") ||
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
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(apiEndpoints.leaveRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  const formatDateTime = (iso) =>
    dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
  const formatDate = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY");

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

  const getFullName = (r) =>
    accountNameMap[r?.accountId] ||
    r?.account?.fullName ||
    [r?.account?.firstName, r?.account?.lastName].filter(Boolean).join(" ") ||
    r?.fullName ||
    r?.requesterName ||
    r?.user?.fullName ||
    "-";

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
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-50 text-slate-800 font-kanit">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="text-slate-800 font-medium">
              กำลังโหลดข้อมูลการลา...
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-sky-500" />
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากระบบ
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-kanit px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            บันทึกคำขอการลาลงระบบ (Admin)
          </h1>
          <p className="text-sm text-slate-600">
            สำหรับบันทึกคำขอการลาที่ส่งนอกระบบออนไลน์ หรือคำขออื่น ๆ แทนผู้ใช้
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            บันทึกคำขอการลาใหม่
          </button>
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

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
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
                className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <label className="text-xs text-slate-600">ถึง</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="relative w-40 md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
              className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs md:text-sm font-medium text-white transition hover:bg-rose-400"
            >
              ล้างตัวกรอง
            </button>
          </div>

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
                      className={`border-t border-slate-100 whitespace-nowrap hover:bg-sky-50 cursor-pointer transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      }`}
                      onClick={() => navigate(`/leave/${r.id}`)}
                    >
                      <td className="px-4 py-3">{getFullName(r)}</td>
                      <td className="px-4 py-3">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {leaveTypesMap[r.leaveTypeId] || "-"}
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
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ก่อนหน้า
              </button>
              <span className="text-sm text-slate-700">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 rounded-full bg-slate-800 p-4 text-white shadow-xl transition hover:bg-slate-700"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isModalOpen && (
        <LeaveRequestModalAdmin
          leaveTypesMap={leaveTypesMap}
          onClose={() => setModalOpen(false)}
          onSuccess={() => fetchLeaveRequests()}
        />
      )}
    </div>
  );
}
