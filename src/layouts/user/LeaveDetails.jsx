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
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaFileAlt className="text-gray-700 text-3xl" />
          <h1 className="text-3xl font-bold">รายละเอียดใบลา</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                เลขที่ใบลา:
              </label>
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                12345678
              </p>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                วัน/เดือน/ปี:
              </label>
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                1 พฤษภาคม 2567
              </p>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-start">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                เรื่อง:
              </label>
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                ขอ{leaveType?.name || "-"}
              </p>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-start">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                เรียน:
              </label>
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800">
                คณบดี/ผู้อำนวยการสำนักงานวิทยาเขตขอนแก่น
              </p>
            </div>
          </div>
          <div className="md:col-span-2 pl-8">
            <div className="flex items-center gap-8 w-full">
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ข้าพเจ้า
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {`${user?.prefixName}${user?.firstName} ${user?.lastName}`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ตำแหน่ง
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {user.position || "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 pl-8">
            <div className="flex items-center gap-8 w-full">
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  สังกัด
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {`${user.department?.organization?.name || "-"}`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ประเภท
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {user.personnelType?.name || "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 pl-8">
            <div className="flex items-center gap-8 w-full">
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ขออนุญาต
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {`${leaveType?.name || "-"}`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  เนื่องจาก
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {reason || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-8 w-full">
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ตั้งแต่
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {formatDate(startDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ถึง
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {formatDate(endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 w-1/6">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  มีกำหนด
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 text-center w-full">
                  {totalDays}
                </p>
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  วัน
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-8 w-full">
              <div className="flex items-center gap-2 flex-[1.2]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ข้าพเจ้าได้
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 text-center w-full">
                  {leaveType?.name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-[2]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ครั้งสุดท้ายเมื่อ
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {formatDate(startDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-[2]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ถึง
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {formatDate(endDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-2 flex-[0.8]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  มีกำหนด
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 text-center w-full">
                  {totalDays}
                </p>
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  วัน
                </label>
              </div>
              <div className="flex items-center gap-2 flex-[3.5]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ช่องทางติดต่อ
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {contact || "-"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-[1.7]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  หมายเลขโทรศัพท์
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {user.phone || "-"}
                </p>
              </div>
            </div>
          </div>
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
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString("th-TH", { month: "long" });
  const year = date.getFullYear() + 543;

  return `วันที่ ${day} ${month} พ.ศ. ${year}`;
};
