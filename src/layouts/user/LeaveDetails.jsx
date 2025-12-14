import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaFileAlt, FaFilePdf } from "react-icons/fa";
import { apiEndpoints, API } from "../../utils/api";

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [lastLeave, setLastLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approver, setApprover] = useState([]);

  // const authHeader = () => {
  //   const token = localStorage.getItem("accessToken");
  //   if (!token) {
  //     Swal.fire("หมดเวลาการใช้งาน", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
  //       () => {
  //         window.location.href = "/login";
  //       }
  //     );
  //     throw new Error("No token");
  //   }
  //   return { headers: { Authorization: `Bearer ${token}` } };
  // };

  // useEffect ที่ 1: โหลดข้อมูล leave ตาม id (ใบปัจจุบัน)
  useEffect(() => {
    const loadLeave = async () => {
      try {
        const res = await API.get(
          apiEndpoints.getLeaveById(id),
          // authHeader()
        );
        // ทดสอบ response
        // console.log("Leave Details:", res.data.data);
        const payload = res?.data?.data ?? res?.data ?? null;
        setLeave(payload); //ได้ข้อมูลใบลา
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

  // useEffect ที่ 2: โหลดข้อมูล leave ล่าสุดของผู้ใช้และประเภทลานี้ (ใบก่อนหน้า startDate < ใบปัจจุบัน)
  useEffect(() => {
    if (!leave || !leave.userId || !leave.leaveType?.id) return;

    const loadLastLeave = async () => {
      try {
        const res = await API.post(
          apiEndpoints.getLastLeaveBefore(leave.userId),
          {
            leaveTypeId: leave.leaveType.id,
            beforeDate: new Date(leave.startDate).toISOString(),
          },
          // authHeader()
        );
        // ทดสอบ response
        // console.log("Last Leave Details:", res.data);
        const payload = res?.data?.data ?? res?.data ?? null;
        setLastLeave(payload);
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

  // useEffect ที่ 3: approver
  useEffect(() => {
    const fetchApprover = async () => {
      try {
        const res = await API.get(apiEndpoints.getAllApprover);
        const result = res?.data?.data ?? res?.data ?? null;
        // console.log("Debug Approver: ", result);
        setApprover(result);
      } catch (err) {
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      }
    };

    fetchApprover();
  }, []);

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

  //--------------------------------------------------------
  //------------------------ Approver ----------------------
  //--------------------------------------------------------

  // Head of Department Case
  const approver1 = approver.find((a) =>
    Array.isArray(a.userRoles) &&
    a.userRoles.some((ur) => ur.role?.name === "APPROVER_1") &&
    a.department.id === leave.user.department.id &&
    a.department.headId === a.id
  );
  // console.log("debug approver1: ", approver1);
  // console.log("dept: ", leave.user.department.id);

  // Verifier Case
  const verifier = approver.find((a) =>
    Array.isArray(a.userRoles) &&
    a.userRoles.some((ur) => ur.role?.name === "VERIFIER") &&
    a.id === leave.verifierId
  );
  // console.log("debug verifier: ", verifier);

  // Approver_2 Case (สารบัญคณะ)
  const approver2 = approver.find((a) =>
    Array.isArray(a.userRoles) &&
    a.userRoles.some((ur) => ur.role?.name === "APPROVER_2") &&
    a.department.organizationId === leave.headOfDepartment.department.organizationId
  );
  // console.log("debig approver2: ", approver2);

  // Approver_3 Case (รองคณบดี)
  const approver3 = approver.find((a) =>
    Array.isArray(a.userRoles) &&
    a.userRoles.some((ur) => ur.role?.name === "APPROVER_3") &&
    a.department.organizationId === leave.headOfDepartment.department.organizationId
  );
  // console.log("debig approver3: ", approver3);

  // Approver_4 Case (คณบดี)
  const approver4 = approver.find((a) =>
    Array.isArray(a.userRoles) &&
    a.userRoles.some((ur) => ur.role?.name === "APPROVER_4") &&
    a.department.organizationId === leave.headOfDepartment.department.organizationId
  );
  // console.log("debig approver4: ", approver4);

  //--------------------------------------------------------
  //------------------------ leave data ----------------------
  //--------------------------------------------------------

  const {
    user,
    leaveType,
    reason,
    startDate,
    endDate,
    totalDays,
    thisTimeDays,
    leavedDays,
    contact,
    status,
    documentNumber,
    documentIssuedDate,
    leaveRequestDetails,
    files,
    approvalSteps,
  } = leave;
  console.log("Leave Request Details:", leave);

  //Can export when leave approved or rejected
  const canExport = status === "APPROVED" || status === "REJECTED";

  const lastStart = lastLeave?.startDate ?? null;
  const lastEnd = lastLeave?.endDate ?? null;
  const lastTotal = lastLeave?.totalDays ?? null;

  const leaveData = {
    documentNumber: documentNumber || "-",//
    documentDate: documentIssuedDate || "-",//
    title: `ขอ${leaveType?.name}`,//
    name: `${user?.prefixName}${user?.firstName} ${user?.lastName}`,//
    position: user?.position || "-",//
    organizationId: user?.department?.organization?.id || "-",//
    personalType: user?.personnelType?.name || "-",//
    leaveType: leaveType?.name || "-",//
    reason: reason || "-",//
    description: "รายละเอียดตัวอย่าง",
    date: "2023-10-15",
    leaveTypeId: leaveType?.id || null,
    startDate: startDate,//
    endDate: endDate,//
    beforeDate: new Date(leave.startDate).toISOString(),
    total: totalDays,//
    thisTime: thisTimeDays,//
    leaved: leavedDays,
    lastLeave: "/",
    lastLeaveStartDate: lastStart,//
    lastLeaveEndDate: lastEnd,//
    lastLeaveTotal: lastTotal,//,
    lastLeaveThisTime: lastLeave?.thisTimeDays || "-",//
    lastLeaved: lastLeave?.leavedDays || "-",
    contact: contact || "-",//
    phone: user?.phone || "-",//
    signature: `${user?.firstName} ${user?.lastName}`,
    commentApprover1: leave?.leaveRequestDetails[0]?.comment || "โปรดพิจารณา",
    signatureApprover1: " ",
    positionApprover1: "หัวหน้าสาขา",
    DateApprover1: leave?.leaveRequestDetails[0]?.reviewedAt || new Date().toISOString(), // ดึงจากวันที่อนุมัติ
    commentApprover2: leave?.leaveRequestDetails[2]?.comment || "โปรดพิจารณา2",
    signatureApprover2: " ",
    positionApprover2: "สารบรรณคณะวิศวกรรมศาสตร์",
    DateApprover2: leave?.leaveRequestDetails[2]?.reviewedAt || new Date().toISOString(),
    commentApprover3: leave?.leaveRequestDetails[3]?.comment || "โปรดพิจารณา3",
    signatureApprover3: " ",
    positionApprover3: "รองคณบดี",
    DateApprover3: leave?.leaveRequestDetails[3]?.reviewedAt || new Date().toISOString(),
    signatureVerifier: " ",
    DateVerifier: leave?.documentIssuedDate,
    isApprove: leave?.leaveRequestDetails[1]?.status === "APPROVED" ?? false,
    commentApprover4: leave?.leaveRequestDetails[4]?.comment || "โปรดพิจารณา4",
    signatureApprover4: " ",
    DateApprover4: leave?.leaveRequestDetails[4]?.reviewedAt || new Date().toISOString(),
  };
  // console.log("Prepared Leave Data for Report:", leaveData);
  // console.log("Debug isApprove: ", leaveData.isApprove);

  const downloadReport = async () => {
    setLoading(true);
    try {
      // เรียก API ด้วยข้อมูล leaveData ที่ส่งมาจาก props
      // ต้องมั่นใจว่า leaveData มีโครงสร้างครบตามที่ backend ต้องการ

      // const response = await axios.post(
      //   "...https://backend-faculty-of-engineering-leave.onrender.com/api/download-report",
      //   leaveData,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      //     },
      //     responseType: "blob", // สำคัญมาก! ให้รับไฟล์เป็น blob
      //   }
      // );

      const response = await API.post(
        apiEndpoints.downloadReport,
        leaveData,
        {
          responseType: "blob",
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
                  {thisTimeDays}
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
                  {lastLeave?.thisTimeDays ? lastLeave.thisTimeDays : "-"}
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
            className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${status === "APPROVED"
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

        <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition font-medium"
          >
            ← กลับหน้ารายการลา
          </button>
          <button
            onClick={canExport ? downloadReport : undefined}
            disabled={loading}
            className={`px-4 py-2 rounded text-white font-medium transition
              ${canExport
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {loading ? "กำลังดาวน์โหลด..." : "ส่งออก PDF"}
          </button>
        </div>

        {/* message notice case pending */}
        {!canExport && (
          <p className="mt-3 text-sm text-red-500 text-center sm:text-left">
            หมายเหตุ: กระบวนการอนุมัติใบลายังไม่เสร็จสิ้น จึงไม่สามารถส่งออก PDF ได้
            กรุณารอให้ใบลาได้รับการอนุมัติหรือถูกปฏิเสธก่อน
          </p>
        )}
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
