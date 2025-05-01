import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown, Pencil } from "lucide-react";
import Swal from "sweetalert2";

// Extend dayjs isBetween plugin
dayjs.extend(isBetween);

export default function LeaveVerifier() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");

  // Inline comments state
  const [comments, setComments] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Labels and lookup
  const statusLabels = { APPROVED: "ผ่าน", REJECTED: "ไม่ผ่าน" };
  const leaveTypes = { 1: "ลาป่วย", 2: "ลากิจส่วนตัว", 3: "ลาพักผ่อน" };

  // Fetch leave requests
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestForVerifier, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(res.data || []);
      } catch (err) {
        console.error("Error loading requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering logic
  const filtered = useMemo(() => {
    return leaveRequests.filter(item => {
      const created = dayjs(item.createdAt).format("YYYY-MM-DD");
      let okDate = true;
      if (filterStartDate && filterEndDate) {
        okDate = dayjs(created).isBetween(filterStartDate, filterEndDate, null, "[]");
      } else if (filterStartDate) {
        okDate = created >= filterStartDate;
      } else if (filterEndDate) {
        okDate = created <= filterEndDate;
      }
      const okType = filterLeaveType ? String(item.leaveTypeId) === filterLeaveType : true;
      return okDate && okType;
    });
  }, [leaveRequests, filterStartDate, filterEndDate, filterLeaveType]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date helper
  const formatDate = d => dayjs(d).locale("th").format("DD MMM YYYY");

  // Handle approve/reject with inline comments
  const handleAction = async (detailId, action) => {
    const comment = (comments[detailId] || "").trim();
    if (!comment) {
      Swal.fire("Error", "กรุณาใส่ความคิดเห็นก่อนดำเนินการ", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = action === "approve"
        ? apiEndpoints.ApproveleaveRequestsByVerifier(detailId)
        : apiEndpoints.RejectleaveRequestsByVerifier(detailId);
      await axios.patch(
        url,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from view after action
      setLeaveRequests(prev =>
        prev.filter(r => r.leaveRequestDetails?.[0]?.id !== detailId)
      );
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถดำเนินการได้", "error");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white font-kanit text-black">
      <h1 className="text-3xl font-bold mb-8 text-center">คำขอลาทั้งหมด</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-lg text-black">จาก</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={e => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
            className="bg-white text-black text-base border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <label className="text-lg text-black">ถึง</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={e => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
            className="bg-white text-black text-base border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="relative w-48">
          <select
            value={filterLeaveType}
            onChange={e => { setFilterLeaveType(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white text-black text-base px-4 py-2 pr-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none"
          >
            <option value="">ประเภทการลาทั้งหมด</option>
            {Object.entries(leaveTypes).map(([id, name]) => (
              <option key={id} value={id} className="bg-white text-black">
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={() => {
            setFilterStartDate("");
            setFilterEndDate("");
            setFilterLeaveType("");
            setCurrentPage(1);
          }}
          className="bg-red-500 hover:bg-red-600 text-white text-lg px-6 py-2 rounded-lg shadow"
        >
          ล้าง
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-black">ชื่อผู้ลา</th>
              <th className="px-4 py-3 text-black">ประเภทการลา</th>
              <th className="px-4 py-3 text-black">วันที่เริ่ม</th>
              <th className="px-4 py-3 text-black">วันที่สิ้นสุด</th>
              <th className="px-4 py-3 text-black">วันที่ยื่น</th>
              <th className="px-4 py-3 text-black">สถานะ</th>
              <th className="px-4 py-3 text-black">ความคิดเห็น</th>
              <th className="px-4 py-3 text-center text-black">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length > 0 ? displayItems.map(item => {
              const detailId = item.leaveRequestDetails?.[0]?.id;
              return (
                <tr key={item.id} className={item.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-black">{item.user?.prefixName} {item.user?.firstName} {item.user?.lastName}</td>
                  <td className="px-4 py-2 text-black">{leaveTypes[item.leaveTypeId] || '-'}</td>
                  <td className="px-4 py-2 text-black">{formatDate(item.startDate)}</td>
                  <td className="px-4 py-2 text-black">{formatDate(item.endDate)}</td>
                  <td className="px-4 py-2 text-black">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-2 text-black">{statusLabels[item.status] || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={comments[detailId] || ''}
                        onChange={e => setComments(c => ({ ...c, [detailId]: e.target.value }))}
                        className="w-full bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="ใส่ความคิดเห็น"
                      />
                      <Pencil className="w-5 h-5 text-gray-500 cursor-pointer" />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button onClick={() => handleAction(detailId, 'approve')} disabled={!detailId} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">ผ่าน</button>
                    <button onClick={() => handleAction(detailId, 'reject')} disabled={!detailId} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">ไม่ผ่าน</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">ไม่มีข้อมูลคำขอ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50">ก่อนหน้า</button>
          <span className="px-3 py-1 text-black">หน้า {currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg bg-white text-black disabled:opacity-50">ถัดไป</button>
        </div>
      )}
    </div>
  );
}
