import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { apiEndpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import { Plus, ChevronDown, PlusCircle, X } from "lucide-react";

dayjs.extend(isBetween);
const PAGE_SIZE = 10;

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
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

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
        headers: { Authorization: `Bearer ${token}` }
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

      const token = localStorage.getItem("accessToken");
      await axios.post(apiEndpoints.adminLeaveRequests, fd, {
        headers: { 
          // "Content-Type": "multipart/form-data", 
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true,
      });
      onSuccess?.();
      onClose();
    } catch {
      console.error("Submit error:",
        err?.response?.status,
        err?.response?.data || err?.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[min(92vw,720px)] max-h-[90vh] overflow-hidden rounded-xl bg-white p-6 text-black shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">บันทึกคำขอการลา (Admin)</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
              <div >
                <label className="mb-1 block text-sm">คำนำหน้า</label>
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
                <label className="mb-1 block text-sm">ชื่อ</label>
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
                <label className="mb-1 block text-sm">นามสกุล</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow z-10">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => pickUser(u)}
                      className="flex w-full items-center justify-between px-3 py-2 hover:bg-gray-50"
                    >
                      <span>{`${u.prefixName ?? ""} ${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()}</span>
                      <span className="text-xs text-gray-500">ID: {u.id}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="text-sm text-green-700">
                  ผู้ใช้ที่เลือก: {`${selectedUser.prefixName ?? ""} ${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim()} (ID: {selectedUser.id})
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm">ประเภทการลา</label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className={inputStyle}
                  required
                >
                  <option value="">-- เลือกประเภทการลา --</option>
                  {Object.entries(leaveTypesMap || {}).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm">วันที่เริ่มลา</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label className="mb-1 block text-sm">วันที่สิ้นสุด</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label className="mb-1 block text-sm">เหตุผล</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label className="mb-1 block text-sm">ช่องทางติดต่อ</label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label className="mb-1 block text-sm">เลขที่เอกสาร</label>
                <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label className="mb-1 block text-sm">วันที่ออกเอกสาร</label>
                <input type="date" value={documentIssuedDate} onChange={(e) => setDocumentIssuedDate(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label className="mb-1 block text-sm">แนบรูปภาพ</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex item-center justify-end gap-3 border-t bg-white px-6 py-4">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "กำลังบันทึก..." : "บันทึก"}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddOtherRequest() {
  const navigate = useNavigate();
  const { leaveRequest = [], setLeaveRequest } = useLeaveRequest();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  // const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [leaveTypesMap, setLeaveTypesMap] = useState({});
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const statusLabels = { APPROVED: "อนุมัติแล้ว", PENDING: "รอดำเนินการ", REJECTED: "ถูกปฏิเสธ", CANCELLED: "ยกเลิกแล้ว" };
  const statusColors = { APPROVED: "bg-green-500 text-white", PENDING: "bg-yellow-500 text-white", REJECTED: "bg-red-500 text-white", CANCELLED: "bg-gray-500 text-white" };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(apiEndpoints.leaveRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Leave requests response:", res.data.data);
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.leaveRequest || res.data.leaveRequests)
          ? res.data.leaveRequest || res.data.leaveRequests
          : [];
      setLeaveRequest(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
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
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">กำลังโหลดข้อมูลการลา...</div>;
  }

  return (
    <div className="px-6 py-10 bg-white min-h-screen text-black font-kanit">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">บันทึกคำขอการลาลงระบบ</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center rounded bg-blue-600 px-4 py-2 text-white shadow transition duration-300 hover:bg-blue-700 whitespace-nowrap"
          >
            <PlusCircle className="mr-2" /> บันทึกคำขอการลา
          </button>
        </div>

        {/* filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* date */}
          <div className="flex items-center gap-2">
            <label className="text-sm">จาก</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <label className="text-sm">ถึง</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* status */}
          <div className="relative w-48">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">สถานะทั้งหมด</option>
              {Object.keys(statusLabels).map((k) => (
                <option key={k} value={k}>{statusLabels[k]}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* leaveType */}
          <div className="relative w-48">
            <select value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">ประเภทการลาทั้งหมด</option>
              {Object.entries(leaveTypesMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* sortOrder */}
          <div className="relative w-48">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="desc">เรียงจากใหม่ไปเก่า</option>
              <option value="asc">เรียงจากเก่าไปใหม่</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* clear */}
          <button onClick={() => { setFilterStartDate(""); setFilterEndDate(""); setFilterStatus(""); setFilterLeaveType(""); setSortOrder("desc"); }} className="rounded-lg bg-red-500 px-3 py-2 text-white transition hover:bg-red-600">
            ล้าง
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-300 shadow overflow-x-auto width-full">
          <table className="min-w-full w-full text-sm text-black">
            <thead>
              <tr className="bg-gray-100 text-gray-800 whitespace-nowrap">
                {["วันที่ยื่น", "ประเภทการลา", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "สถานะ"].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((r) => (
                <tr key={r.id} className="border-t whitespace-nowrap hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/leave/${r.id}`)}>
                  <td className="px-4 py-3">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">{leaveTypesMap[r.leaveTypeId] || "-"}</td>
                  <td className="px-4 py-3">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs ${statusColors[r.status] || "bg-gray-200"}`}>{statusLabels[r.status] || r.status}</span>
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-50">ก่อนหน้า</button>
            <div className="px-2 text-sm">หน้า {currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="rounded border px-3 py-1 disabled:opacity-50">ถัดไป</button>
          </div>
        )}
      </div>

      <button onClick={() => setModalOpen(true)} className="fixed bottom-8 right-8 rounded-full bg-gray-600 p-4 text-white shadow-lg transition hover:bg-gray-700">
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
