import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ChevronDown } from "lucide-react";

dayjs.extend(isBetween);

export default function LeaveReceiver() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // new state for inline comments
  const [comments, setComments] = useState({});

  // filters
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  // load data
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestForReceiver, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(res.data || []);
      } catch (error) {
        console.error("❌ Error loading leave requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  // filter logic
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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = dateStr =>
    dayjs(dateStr).locale("th").format("DD MMM YYYY");

  // approve / reject handlers using inline comment
  const handleApprove = async leaveRequestId => {
    const comment = comments[leaveRequestId]?.trim();
    if (!comment) {
      Swal.fire("กรุณาระบุความคิดเห็นก่อนส่ง");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.ApproveleaveRequestsByReceiver(leaveRequestId),
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("สำเร็จ", "อนุมัติคำขอเรียบร้อยแล้ว", "success");
      setLeaveRequests(r => r.filter(req => req.id !== leaveRequestId));
    } catch (error) {
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการอนุมัติ";
      Swal.fire("ผิดพลาด", msg, "error");
    }
  };

  const handleReject = async leaveRequestId => {
    const comment = comments[leaveRequestId]?.trim();
    if (!comment) {
      Swal.fire("กรุณาระบุความคิดเห็นก่อนส่ง");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        apiEndpoints.RejectleaveRequestsByReceiver(leaveRequestId),
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("สำเร็จ", "ปฏิเสธคำขอเรียบร้อยแล้ว", "success");
      setLeaveRequests(r => r.filter(req => req.id !== leaveRequestId));
    } catch (error) {
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการปฏิเสธ";
      Swal.fire("ผิดพลาด", msg, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดคำขอ...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen text-black font-kanit">
      <h1 className="text-2xl font-bold mb-6 text-center">คำขอลาทั้งหมด</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm">จาก</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={e => {
              setFilterStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white text-black text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-sm">ถึง</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={e => {
              setFilterEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white text-black text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="relative w-48">
          <select
            value={filterLeaveType}
            onChange={e => {
              setFilterLeaveType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white text-black text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">ประเภทการลาทั้งหมด</option>
            {Object.entries(leaveTypes).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <button
          onClick={() => {
            setFilterStartDate("");
            setFilterEndDate("");
            setFilterLeaveType("");
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          ล้าง
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="px-4 py-2 border border-gray-200">ชื่อผู้ลา</th>
              <th className="px-4 py-2 border border-gray-200">ประเภทการลา</th>
              <th className="px-4 py-2 border border-gray-200">วันที่เริ่ม</th>
              <th className="px-4 py-2 border border-gray-200">วันที่สิ้นสุด</th>
              <th className="px-4 py-2 border border-gray-200">วันที่ยื่น</th>
              <th className="px-4 py-2 border border-gray-200">ความคิดเห็น</th>
              <th className="px-4 py-2 border border-gray-200">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length > 0 ? (
              displayItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-200">
                    {item.user?.prefixName} {item.user?.firstName} {item.user?.lastName}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {leaveTypes[item.leaveTypeId] || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {formatDate(item.startDate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {formatDate(item.endDate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea
                      value={comments[item.id] || ""}
                      onChange={e =>
                        setComments(prev => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="ระบุความคิดเห็น..."
                      className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
                    />
                  </td>
                  <td className="px-6 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.leaveRequestDetails?.[0]?.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ยอมรับ
                    </button>
                    <button
                      onClick={() => handleReject(item.leaveRequestDetails?.[0]?.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ปฏิเสธ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  ไม่มีข้อมูลคำขอ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <span>
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
