import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaFileAlt } from "react-icons/fa";
import { apiEndpoints } from "../../utils/api";

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("หมดเวลาการใช้งาน", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => {
          window.location.href = "/login";
        }
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadLeave = async () => {
    try {
      const res = await axios.get(apiEndpoints.getLeaveById(id), authHeader());
      setLeave(res.data.data);
    } catch (err) {
      Swal.fire("ผิดพลาด", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500 font-kanit">
        กำลังโหลด...
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500 font-kanit">
        ไม่พบข้อมูลการลา
      </div>
    );
  }

  const {
    user,
    leaveType,
    reason,
    startDate,
    endDate,
    totalDays,
    contact,
    contactPhone,
    status,
    leaveRequestDetails,
    files,
    approvalSteps,
  } = leave;

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-5xl mx-auto bg-gray-50 p-6 rounded-xl shadow">
        <div className="flex items-center gap-3 mb-6">
          <FaFileAlt className="text-gray-700 text-3xl" />
          <h1 className="text-3xl font-bold">รายละเอียดใบลา</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Item
            label="ชื่อ-นามสกุล"
            value={`${user?.prefixName}${user?.firstName} ${user?.lastName}`}
          />
          <Item label="ประเภทการลา" value={leaveType?.name || "-"} />
          <Item
            label="ช่วงวันลา"
            value={`ตั้งแต่ ${formatDate(startDate)} ถึง ${formatDate(
              endDate
            )}`}
          />
          <Item label="จำนวนวันที่ลา" value={`${totalDays || 0} วัน`} />
          <Item label="เหตุผล/หมายเหตุ" value={reason || "-"} />
          <Item label="ที่อยู่ระหว่างลา" value={contact || "-"} />
          <Item label="เบอร์ติดต่อ" value={contactPhone || "-"} />
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-2">ความคิดเห็นผู้อนุมัติ</h2>
          {approvalSteps?.length > 0 ? (
            approvalSteps.map((step, i) => (
              <div
                key={i}
                className="bg-white border px-4 py-2 rounded-lg mb-2"
              >
                <p className="text-sm text-gray-600 italic">
                  สถานะ: {step.status}
                </p>
                <p className="text-sm">
                  – {step.approver?.prefixName}
                  {step.approver?.firstName} {step.approver?.lastName}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">ไม่มีความคิดเห็น</p>
          )}
        </div>

        {files?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">ไฟล์แนบ</h2>
            <ul className="list-disc pl-5">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    เอกสารแนบ {file.type}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 text-right">
          <span
            className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${
              status === "APPROVED"
                ? "bg-green-500"
                : status === "REJECTED"
                ? "bg-red-500"
                : "bg-yellow-400"
            }`}
          >
            สถานะ:{" "}
            {status === "APPROVED"
              ? "อนุมัติแล้ว"
              : status === "REJECTED"
              ? "ไม่อนุมัติ"
              : "รออนุมัติ"}
          </span>
        </div>

        <div className="mt-6 text-center sm:text-left">
          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition font-medium"
          >
            ← กลับหน้ารายการลา
          </button>
        </div>
      </div>
    </div>
  );
}

const Item = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
      {value}
    </p>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
