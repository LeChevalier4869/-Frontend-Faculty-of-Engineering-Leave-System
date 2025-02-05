import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams } from "react-router-dom";
import axios from "axios";
import { apiEndpoints } from "../utils/api";

// Approver Component (List of Leave Requests)
function Approver() {
  const [pendingRequest, setPendingRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestLanding, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequest(res.data.leaveRequest);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching leave requests");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequest();
  }, []);
  console.log(pendingRequest)
  const handleApprove = async (id) => {
    const confirmApprove = window.confirm("คุณต้องการอนุมัติการลานี้หรือไม่?");
    if (confirmApprove) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8000/leave-requests/${id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
        alert("อนุมัติสำเร็จ!");
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการอนุมัติ");
      }
    }
  };

  const handleReject = async (id) => {
    const confirmReject = window.confirm("คุณต้องการปฏิเสธการลานี้หรือไม่?");
    if (confirmReject) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8000/leave-requests/${id}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingRequest((prev) => prev.filter((leave) => leave.id !== id));
        alert("ปฏิเสธสำเร็จ!");
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">การลาที่รอการอนุมัติ</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">วันที่</th>
              <th className="border border-gray-300 px-4 py-2 text-left">ชื่อผู้ยื่นลา</th>
              <th className="border border-gray-300 px-4 py-2 text-left">ประเภทการลา</th>
              <th className="border border-gray-300 px-4 py-2 text-left">วันที่เริ่ม</th>
              <th className="border border-gray-300 px-4 py-2 text-left">วันที่สิ้นสุด</th>
              <th className="border border-gray-300 px-4 py-2 text-left">สถานะ</th>
              <th className="border border-gray-300 px-4 py-2 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pendingRequest) && pendingRequest.length > 0 ? (
              [...pendingRequest]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((leave) => (
                  <tr key={leave.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        to={`/leave-requests/${leave.id}`} // Link to detailed page
                        className="text-blue-500 hover:underline"
                      >
                        {formatDate(leave.createdAt)}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{leave.userId}</td>
                    <td className="border border-gray-300 px-4 py-2">{leave.leaveType.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{formatDate(leave.startDate)}</td>
                    <td className="border border-gray-300 px-4 py-2">{formatDate(leave.endDate)}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`font-bold text-center ${leave.status === "APPROVED" ? "text-green-500" : leave.status === "PENDING" ? "text-yellow-500" : "text-red-500"}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button onClick={() => handleReject(leave.id)} className="btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded mr-2">
                        ปฏิเสธ
                      </button>
                      <button onClick={() => handleApprove(leave.id)} className="btn bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded">
                        อนุมัติ
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="7" className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                  ไม่มีข้อมูลการลา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Approver;
// // LeaveRequestDetail Component (Detailed View)
// function LeaveRequestDetail() {
//   const { id } = useParams();
//   const [leaveRequest, setLeaveRequest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLeaveRequest = async () => {
//       try {
//         let token = localStorage.getItem("token");
//         const res = await axios.get(`${apiEndpoints.leaveRequestLanding}/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setLeaveRequest(res.data.leaveRequest);
//       } catch (err) {
//         setError(err.response?.data?.message || "Error fetching leave request details");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaveRequest();
//   }, [id]);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${day}/${month}/${year}`;
//   };

//   if (loading) return <div className="text-center mt-8">Loading...</div>;
//   if (error) return <div className="text-center text-red-500 mt-8">Error: {error}</div>;

//   return (
//     <div className="max-w-5xl mx-auto mt-8 p-4">
//       <h2 className="text-3xl font-bold text-center mb-6">รายละเอียดการลา</h2>
//       {leaveRequest ? (
//         <div>
//           <p><strong>ชื่อผู้ยื่นลา:</strong> {leaveRequest.user.name}</p>
//           <p><strong>ประเภทการลา:</strong> {leaveRequest.leaveType.name}</p>
//           <p><strong>วันที่เริ่มลา:</strong> {formatDate(leaveRequest.startDate)}</p>
//           <p><strong>วันที่สิ้นสุดลา:</strong> {formatDate(leaveRequest.endDate)}</p>
//           <p><strong>รายละเอียดเพิ่มเติม:</strong> {leaveRequest.details || "ไม่มีข้อมูล"}</p>
//           <p><strong>สถานะการลา:</strong> {leaveRequest.status}</p>
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">ไม่พบข้อมูลการลา</p>
//       )}
//     </div>
//   );
// }

// App Component with Routing
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/leave-requests" element={<Approver />} />
//         <Route path="/leave-requests/:id" element={<LeaveRequestDetail />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
