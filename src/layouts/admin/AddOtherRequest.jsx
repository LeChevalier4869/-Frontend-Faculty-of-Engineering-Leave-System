import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { apiEndpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import { Plus, ChevronDown, PlusCircle, X } from "lucide-react";

dayjs.extend(isBetween);
const PAGE_SIZE = 10;

function LeaveRequestModalAdmin({ open, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentIssuedDate, setDocumentIssuedDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    if (startDate) fd.append("startDate", startDate);
    if (endDate) fd.append("endDate", endDate);
    if (reason) fd.append("reason", reason);
    if (contact) fd.append("contact", contact);
    if (documentNumber) fd.append("documentNumber", documentNumber);
    if (documentIssuedDate) fd.append("documentIssuedDate", documentIssuedDate);
    if (imageFile) fd.append("images", imageFile);
    try {
      const token = localStorage.getItem("accessToken");
      const createUrl = apiEndpoints.adminLeaveRequests ?? apiEndpoints.leaveRequest;
      await axios.post(createUrl, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <style>{`
        [data-force-light] { color-scheme: light; }
        [data-force-light] input,
        [data-force-light] select,
        [data-force-light] textarea {
          -webkit-appearance: none !important;
          appearance: none !important;
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        [data-force-light] input:-webkit-autofill,
        [data-force-light] textarea:-webkit-autofill,
        [data-force-light] select:-webkit-autofill {
          -webkit-text-fill-color: #111827 !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: inset 0 0 0 1000px #ffffff !important;
        }
      `}</style>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 text-black" data-force-light>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">บันทึกคำขอการลา (Admin)</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">วันที่เริ่มลา</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="mb-1 block text-sm">วันที่สิ้นสุด</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="mb-1 block text-sm">เหตุผล</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="mb-1 block text-sm">ช่องทางติดต่อ</label>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm">เลขที่เอกสาร</label>
            <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm">วันที่ออกเอกสาร</label>
            <input type="date" value={documentIssuedDate} onChange={(e) => setDocumentIssuedDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text_sm">แนบรูปภาพ</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">ยกเลิก</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "กำลังบันทึก..." : "บันทึก"}</button>
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

  const statusLabels = { APPROVED: "อนุมัติแล้ว", PENDING: "รอดำเนินการ", REJECTED: "ถูกปฏิเสธ", CANCELLED: "ยกเลิกแล้ว" };
  const statusColors = { APPROVED: "bg-green-500 text-white", PENDING: "bg-yellow-500 text-white", REJECTED: "bg-red-500 text-white", CANCELLED: "bg-gray-500 text-white" };

  const fetchAccountNames = async (rows) => {
    const token = localStorage.getItem("accessToken");
    const ids = Array.from(new Set(rows.map((r) => r.accountId).filter((id) => !!id && !accountNameMap[id])));
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
        const name = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.displayName || "";
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
    } catch {
      setLeaveRequest([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(apiEndpoints.getAllLeaveTypes);
      const map = {};
      (res.data.data || []).forEach((lt) => {
        map[lt.id] = lt.name;
      });
      setLeaveTypesMap(map);
    } catch {}
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  const formatDateTime = (iso) => dayjs(iso).locale("th").format("DD/MM/YYYY HH:mm");
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
        byDate = dayjs(created).isBetween(filterStartDate, filterEndDate, null, "[]");
      } else if (filterStartDate) {
        byDate = created >= filterStartDate;
      } else if (filterEndDate) {
        byDate = created <= filterEndDate;
      }
      const byStatus = filterStatus ? lr.status === filterStatus : true;
      const byType = filterLeaveType ? String(lr.leaveTypeId) === filterLeaveType : true;
      return byDate && byStatus && byType;
    });
  }, [leaveRequest, filterStartDate, filterEndDate, filterStatus, filterLeaveType, sortOrder]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getFullName = (r) =>
    accountNameMap[r?.accountId] ||
    r?.account?.fullName ||
    [r?.account?.firstName, r?.account?.lastName].filter(Boolean).join(" ") ||
    r?.fullName ||
    r?.requesterName ||
    r?.user?.fullName ||
    "-";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">กำลังโหลดข้อมูลการลา...</div>;
  }

  return (
    <div className="px-6 py-10 bg-white min-h-screen text-black font-kanit">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">บันทึกคำขอการลาลงระบบ</h1>
          <button onClick={() => setModalOpen(true)} className="flex items-center rounded bg-blue-600 px-4 py-2 text-white shadow transition duration-300 hover:bg-blue-700 whitespace-nowrap">
            <PlusCircle className="mr-2" /> บันทึกคำขอการลา
          </button>
        </div>
        <div className="mb-6 flex flex_wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">จาก</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <label className="text-sm">ถึง</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="relative w-48">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">สถานะทั้งหมด</option>
              {Object.keys(statusLabels).map((k) => (
                <option key={k} value={k}>{statusLabels[k]}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="relative w-48">
            <select value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">ประเภทการลาทั้งหมด</option>
              {Object.entries(leaveTypesMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="relative w-48">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="desc">เรียงจากใหม่ไปเก่า</option>
              <option value="asc">เรียงจากเก่าไปใหม่</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <button onClick={() => { setFilterStartDate(""); setFilterEndDate(""); setFilterStatus(""); setFilterLeaveType(""); setSortOrder("desc"); }} className="rounded-lg bg-red-500 px-3 py-2 text-white transition hover:bg-red-600">
            ล้าง
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-300 shadow overflow-x-auto width-full">
          <table className="min-w-full w-full text-sm text-black">
            <thead>
              <tr className="bg-gray-100 text-gray-800 whitespace-nowrap">
                {["ชื่อ", "วันที่ยื่น", "ประเภทการลา", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "สถานะ"].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((r) => (
                <tr key={r.id} className="border-t whitespace-nowrap hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/leave/${r.id}`)}>
                  <td className="px-4 py-3">{getFullName(r)}</td>
                  <td className="px-4 py-3">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">{leaveTypesMap[r.leaveTypeId] || "-"}</td>
                  <td className="px-4 py-3">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs ${statusColors[r.status] || "bg-gray-200"}`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify_center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-50">ก่อนหน้า</button>
            <div className="px-2 text-sm">หน้า {currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="rounded border px-3 py-1 disabled:opacity-50">ถัดไป</button>
          </div>
        )}
      </div>
      <button onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8 rounded-full bg-gray-600 p-4 text-white shadow-lg transition hover:bg-gray-700">
        <Plus className="h-6 w-6" />
      </button>
      <LeaveRequestModalAdmin open={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={() => fetchLeaveRequests()} />
    </div>
  );
}
