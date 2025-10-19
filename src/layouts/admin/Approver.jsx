import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ import sweetalert2
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import { Check, X, Users, Loader2 } from "lucide-react"; // ✅ เพิ่ม Loader2 (icon หมุน)

function Approver() {
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null); // ✅ เอาไว้บอกว่า Row ไหนกำลังกด Approve/Reject

  const navigate = useNavigate();

  const leaveTypes = {
    1: "ลาป่วย",
    2: "ลากิจส่วนตัว",
    3: "ลาพักผ่อน",
  };

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        setLoading(true);
        let token = localStorage.getItem("accessToken");
        const res = await axios.get(apiEndpoints.leaveRequestLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ API Response:", res.data);
  
        // --- เช็กว่ามันมี leaveRequest ไหม
        if (Array.isArray(res.data.leaveRequest)) {
          setPendingRequest(res.data.leaveRequest);
        } else if (Array.isArray(res.data.data)) {
          setPendingRequest(res.data.data);
        } else if (Array.isArray(res.data)) {
          setPendingRequest(res.data);
        } else {
          console.error("❌ ไม่พบข้อมูล leaveRequest ที่ถูกต้อง");
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
      let token = localStorage.getItem("accessToken");
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
    } catch (err) {
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
      let token = localStorage.getItem("accessToken");
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
    } catch (err) {
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

  if (loading == false) {
    const filteredRequests = pendingRequest?.filter((leave) =>
      `${leave.users.prefixName}${leave.users.firstName} ${leave.users.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลการลา...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-kanit">
      <div className="max-w-7xl mx-auto bg-white text-black rounded-2xl shadow p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold mb-6">การลาที่รอการอนุมัติ</h2>

        {/* Search and Actions */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full sm:w-72"
          />
          <div className="flex gap-2">
            <button className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded text-sm">
              Filter
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded text-sm">
              Group By
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded text-sm">
              Actions
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">
              + Create
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Requested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rejected</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">
                  <input type="checkbox" disabled />
                </th>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Leave Type</th>
                <th className="p-3 text-left">Start Date</th>
                <th className="p-3 text-left">End Date</th>
                <th className="p-3 text-left">Requested Days</th>
                <th className="p-3 text-center">Leave</th>
                <th className="p-3 text-center">Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((leave) => (
                <tr key={leave.id} className="border-t hover:bg-gray-100">
                  <td className="p-3 text-left">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      {leave.users.firstName.charAt(0)}
                      {leave.users.lastName.charAt(0)}
                    </div>
                    <span>{leave.users.prefixName}{leave.users.firstName} {leave.users.lastName}</span>
                  </td>
                  <td className="p-3">{leaveTypes[leave.leaveTypeId] || "ไม่ระบุ"}</td>
                  <td className="p-3">{formatDate(leave.startDate)}</td>
                  <td className="p-3">{formatDate(leave.endDate)}</td>
                  <td className="p-3 text-center">{leave.requestedDays || "1.0"}</td>
                  <td className="p-3 text-center">
                    <Users size={20} className="mx-auto" />
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:opacity-50"
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
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:opacity-50"
                      disabled={processingId === leave.id}
                    >
                      {processingId === leave.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    ไม่มีข้อมูลการลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-1">
          {Array.from(
            { length: Math.ceil(filteredRequests.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Approver;
