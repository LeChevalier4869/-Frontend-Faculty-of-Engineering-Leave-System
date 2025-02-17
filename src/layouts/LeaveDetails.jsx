import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import getApiUrl from "../utils/apiUtils";

function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveDetail, setLeaveDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveDetail = async () => {
      try {
        let token = localStorage.getItem("token");
        const response = await axios.get(getApiUrl(`leave-requests/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveDetail(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const handleApprove = async () => {
    if (window.confirm("คุณต้องการอนุมัติคำขอนี้หรือไม่?")) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(getApiUrl(`leave-requests/${id}/approve`), {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("อนุมัติสำเร็จ!");
        navigate(-1);
      } catch {
        alert("เกิดข้อผิดพลาดในการอนุมัติ");
      }
    }
  };

  const handleReject = async () => {
    if (window.confirm("คุณต้องการปฏิเสธคำขอนี้หรือไม่?")) {
      try {
        let token = localStorage.getItem("token");
        await axios.post(getApiUrl(`leave-requests/${id}/reject`), {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("ปฏิเสธสำเร็จ!");
        navigate(-1);
      } catch {
        alert("เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">รายละเอียดการลา</h2>
      <p><strong>วันที่เริ่ม:</strong> {leaveDetail.startDate}</p>
      <p><strong>วันที่สิ้นสุด:</strong> {leaveDetail.endDate}</p>
      <p><strong>ประเภท:</strong> {leaveDetail.leaveType}</p>
      <p><strong>สถานะ:</strong> {leaveDetail.status}</p>

      {/* เฉพาะผู้อนุมัติเท่านั้นที่เห็นปุ่ม */}
      {leaveDetail.status === "PENDING" && (
        <div className="mt-4">
          <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
            อนุมัติ
          </button>
          <button onClick={handleReject} className="bg-red-500 text-white px-4 py-2 rounded">
            ปฏิเสธ
          </button>
        </div>
      )}
    </div>
  );
}

export default LeaveDetail;
