import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";

function LeaveDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [leaveData, setLeaveData] = useState(location.state?.leaveData || null);
  const [loading, setLoading] = useState(!leaveData);

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(getApiUrl(`leave-requests/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveData(res.data);
      } catch (error) {
        console.error("❌ Error fetching leave detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!leaveData) {
      fetchLeaveRequest();
    }
  }, [id, leaveData]);

  if (loading) {
    return <div className="p-6 text-gray-500">กำลังโหลดข้อมูลใบลา...</div>;
  }

  if (!leaveData) {
    return <div className="p-6 text-red-500">ไม่พบข้อมูลใบลา</div>;
  }

  return (
    <div className="p-8 font-kanit bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6">รายละเอียดใบลา</h1>
        <div className="space-y-4 text-black">
          <p><strong>ประเภทการลา:</strong> {leaveData.leaveTypeName || "-"}</p>
          <p><strong>วันเริ่มต้น:</strong> {leaveData.startDate || "-"}</p>
          <p><strong>วันสิ้นสุด:</strong> {leaveData.endDate || "-"}</p>
          <p><strong>สถานะ:</strong> {leaveData.status || "-"}</p>
          <p><strong>หมายเหตุ:</strong> {leaveData.comment || "-"}</p>
        </div>
      </div>
    </div>
  );
}

export default LeaveDetail;
