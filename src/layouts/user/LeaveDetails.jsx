import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaFileAlt, FaFilePdf } from "react-icons/fa";
import { apiEndpoints } from "../../utils/api";

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [lastLeave, setLastLeave] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
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

  // const loadLeave = async () => {
  //   try {
  //     const res = await axios.get(apiEndpoints.getLeaveById(id), authHeader());
  //     setLeave(res.data.data);
  //     console.log("Leave Details:", res.data.data);
  //   } catch (err) {
  //     Swal.fire("ผิดพลาด", err.response?.data?.message || err.message, "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const loadLastLeave = async () => {
  //   try {
  //     const res = await axios.post(apiEndpoints.getLastLeaveRequestByUserAndType(user?.id),{
  //       leaveTypeId: leaveType?.id,
  //     }, authHeader());
  //     setLeave(res.data.data);
  //     console.log("Leave Last Details:", res.data.data);
  //   } catch (err) {
  //     Swal.fire("ผิดพลาด", err.response?.data?.message || err.message, "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect ที่ 1: โหลดข้อมูล leave ตาม id
  useEffect(() => {
    const loadLeave = async () => {
      try {
        const res = await axios.get(
          apiEndpoints.getLeaveById(id),
          authHeader()
        );
        // ทดสอบ response
        // console.log("Leave Details:", res.data.data);
        setLeave(res.data.data);
      } catch (err) {
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeave();
  }, [id]);

  // useEffect ที่ 2: โหลดข้อมูล leave ล่าสุดของผู้ใช้และประเภทลานี้
  // ตัวอย่างใน useEffect ที่ 2
  useEffect(() => {
    if (!leave || !leave.userId || !leave.leaveType?.id) return;

    const loadLastLeave = async () => {
      try {
        const res = await axios.post(
          apiEndpoints.getLastLeaveRequestByUserAndType(leave.userId),
          { leaveTypeId: leave.leaveType.id },
          authHeader()
        );
        // ทดสอบ response
        // console.log("Last Leave Details:", res.data);
        setLastLeave(res.data);
      } catch (err) {
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      }
    };

    loadLastLeave();
  }, [leave]);


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
    documentNumber,
    documentIssuedDate,
    leaveRequestDetails,
    files,
    approvalSteps,
  } = leave;

    const leaveData = {
    documentNumber: documentNumber || "ไม่ระบุ",//
    documentDate: documentIssuedDate || "ไม่ระบุ",//
    title: `ขอ${leaveType?.name}`,//
    name: `${user?.prefixName}${user?.firstName} ${user?.lastName}`,//
    position: user?.position || "ไม่ระบุ",//
    organizationId: null,
    personalType: "ข้าราชการ",
    leaveType: "ลาป่วย",
    reason: reason || "ไม่ระบุ",//
    description: "รายละเอียดตัวอย่าง",
    date: "2023-10-15",
    leaveTypeId: "3",
    startDate: startDate,//
    endDate: endDate,//
    total: totalDays,//
    lastLeave: "/",
    lastLeaveStartDate: lastLeave.startDate,//
    lastLeaveEndDate: lastLeave.endDate,//
    lastLeaveTotal: lastLeave.totalDays,//
    contact: contact || "ไม่ระบุ",//
    phone: user.phone || "ไม่ระบุ",//
    signature: "ลายเซ็น",
    commentApprover1: "โปรดพิจารณา",
    signatureApprover1: "ลายเซ็น1",
    positionApprover1: "HR",
    DateApprover1: "12-06-2568",
    commentApprover2: "โปรดพิจารณา2",
    signatureApprover2: "ลายเซ็น2",
    positionApprover2: "HR2",
    DateApprover2: "12-06-2568",
    commentApprover3: "โปรดพิจารณา3",
    signatureApprover3: "ลายเซ็น3",
    positionApprover3: "HR3",
    DateApprover3: "12-06-2568",
    signatureVerifier: "ลายเซ็นผู้ตรวจสอบ",
    DateVerifier: "12-06-2568",
    commentApprover4: "โปรดพิจารณา4",
    signatureApprover4: "ลายเซ็น4",
    DateApprover4: "12-06-2568"
  };
  console.log(leave)

  const downloadReport = async () => {
    setLoading(true);
    try {
      // เรียก API ด้วยข้อมูล leaveData ที่ส่งมาจาก props
      // ต้องมั่นใจว่า leaveData มีโครงสร้างครบตามที่ backend ต้องการ
      const response = await axios.post(
        "https://backend-faculty-of-engineering-leave.onrender.com/api/download-report",
        leaveData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          responseType: "blob", // สำคัญมาก! ให้รับไฟล์เป็น blob
        }
      );

      // สร้าง URL ชั่วคราวจาก blob
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // เปิดไฟล์ PDF ในแท็บใหม่
      window.open(fileURL);

      // หรือถ้าจะให้ดาวน์โหลดอัตโนมัติให้ใช้ code นี้แทน
      /*
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `${leaveData.name || "report"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      */
    } catch (error) {
      console.error("Download error:", error);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        error.response?.data?.error || "ไม่สามารถดาวน์โหลดรายงานได้",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500 font-kanit">
        กำลังโหลด...
      </div>
    );
  }

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
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 text-center w-40">
                {documentNumber || "-"}
              </p>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                วัน/เดือน/ปี:
              </label>
              <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 text-center w-60">
                {formatDate(documentIssuedDate) || "-"}
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
                  {lastLeave?.startDate ? formatDate(lastLeave.startDate) : "-"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-[2]">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  ถึง
                </label>
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {lastLeave?.endDate ? formatDate(lastLeave.endDate) : "-"}
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
                <p className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-800 w-full">
                  {lastLeave?.totalDays ? lastLeave.totalDays : "-"}
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
            <div className="md:col-span-2 flex justify-end mt-10 mr-40">
              <div className="flex flex-col text-center w-max">
                <label className="text-sm font-medium text-gray-700">
                  ขอแสดงความนับถือ
                </label>
                <label className="text-sm font-medium text-gray-700">
                  {`${user?.prefixName}${user?.firstName} ${user?.lastName}`}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-2">
            ความคิดเห็นผู้บังคับบัญชา
          </h2>
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
          <button
            onClick={downloadReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {loading ? "กำลังดาวน์โหลด..." : "ส่งออก PDF"}
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
