import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { Check, X, Users, Loader2 } from "lucide-react";

function Approver() {
  const [pendingRequest, setPendingRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(apiEndpoints.leaveRequestLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data.leaveRequest)) {
          setPendingRequest(res.data.leaveRequest);
        } else if (Array.isArray(res.data.data)) {
          setPendingRequest(res.data.data);
        } else if (Array.isArray(res.data)) {
          setPendingRequest(res.data);
        } else {
          setPendingRequest([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching leave requests");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequest();
  }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${apiEndpoints.leaveRequest}/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
      Swal.fire({
        icon: "success",
        title: "อนุมัติสำเร็จ!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการอนุมัติ",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${apiEndpoints.leaveRequest}/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
      Swal.fire({
        icon: "success",
        title: "ปฏิเสธสำเร็จ!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการปฏิเสธ",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH");
  };

  const filteredRequests = (pendingRequest || []).filter((leave) =>
    `${leave.user.prefixName || ""}${leave.user.firstName || ""} ${
      leave.user.lastName || ""
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="font-medium">กำลังโหลดรายการอนุมัติการลา...</span>
            <span className="text-xs text-slate-400">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-red-400 bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c]">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100 px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-sky-100">
                Approver
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              การลาที่รอการอนุมัติ
            </h2>
            <p className="text-slate-300 text-sm">
              ตรวจสอบและดำเนินการอนุมัติหรือปฏิเสธคำขอลาของบุคลากร
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/70 text-sm text-slate-100 px-3 py-2 rounded-xl border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-sky-500/60 placeholder:text-slate-500 min-w-[220px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-xs md:text-sm text-slate-200 bg-slate-900/70 border border-sky-500/20 rounded-2xl px-4 py-3 shadow-[0_18px_40px_rgba(8,47,73,0.85)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shadow" />
            <span>Requested</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow" />
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400 shadow" />
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow" />
            <span>Rejected</span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/70 border border-sky-500/20 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-slate-900/90 border-b border-slate-700/80">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    <input type="checkbox" disabled className="accent-sky-500" />
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    พนักงาน
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    ประเภทการลา
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    วันเริ่มต้น
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    วันสิ้นสุด
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    จำนวนวัน
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    Leave
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-[0.12em]">
                    การยืนยัน
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((leave, idx) => (
                  <tr
                    key={leave.id}
                    className={`border-t border-slate-800/70 ${
                      idx % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900/70"
                    } hover:bg-slate-800/70 transition`}
                  >
                    <td className="p-3">
                      <input type="checkbox" className="accent-sky-500" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-500/80 flex items-center justify-center text-xs font-semibold text-white shadow-[0_0_14px_rgba(56,189,248,0.8)]">
                          {leave.user?.firstName?.charAt(0)}
                          {leave.user?.lastName?.charAt(0)}
                        </div>
                        <span className="text-slate-100">
                          {leave.user?.prefixName}
                          {leave.user?.firstName} {leave.user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-100">
                      {leaveTypes[leave.leaveTypeId] || "ไม่ระบุ"}
                    </td>
                    <td className="p-3 text-slate-100">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="p-3 text-slate-100">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="p-3 text-center text-slate-100">
                      {leave.requestedDays || "1.0"}
                    </td>
                    <td className="p-3 text-center">
                      <Users
                        size={20}
                        className="mx-auto text-slate-300 opacity-80"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/30 transition"
                          disabled={processingId === leave.id}
                        >
                          {processingId === leave.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="bg-rose-500 hover:bg-rose-400 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-500/30 transition"
                          disabled={processingId === leave.id}
                        >
                          {processingId === leave.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-8 text-center text-slate-400 bg-slate-900/60"
                    >
                      ไม่มีข้อมูลการลา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRequests.length > itemsPerPage && (
            <div className="flex justify-center mt-4 mb-4 gap-1">
              {Array.from(
                {
                  length: Math.ceil(filteredRequests.length / itemsPerPage),
                },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      currentPage === i + 1
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/40"
                        : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Approver;
