import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaFileAlt } from "react-icons/fa";
import { apiEndpoints, API } from "../../utils/api";

let approverCache = null;
let approverCachePromise = null;

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [lastLeave, setLastLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [approver, setApprover] = useState([]);

  const departmentId = leave?.user?.department?.id ?? null;
  const departmentHeadId = leave?.user?.department?.headId ?? null;
  const verifierId = leave?.verifierId ?? null;
  const hodOrganizationId = leave?.headOfDepartment?.department?.organizationId ?? null;

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
    const controller = new AbortController();
    const loadLeave = async () => {
      try {
        const res = await API.get(
          apiEndpoints.getLeaveById(id),
          { signal: controller.signal }
          // authHeader()
        );
        // ทดสอบ response
        // console.log("Leave Details:", res.data.data);
        const payload = res?.data?.data ?? res?.data ?? null;
        setLeave(payload); //ได้ข้อมูลใบลา
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadLeave();

    return () => {
      controller.abort();
    };
  }, [id]);

  // useEffect ที่ 2: โหลดข้อมูล leave ล่าสุดของผู้ใช้และประเภทลานี้ (ใบก่อนหน้า startDate < ใบปัจจุบัน)
  useEffect(() => {
    if (!leave || !leave.userId || !leave.leaveType?.id || !leave.startDate) return;

    const controller = new AbortController();

    const loadLastLeave = async () => {
      try {
        const res = await API.post(
          apiEndpoints.getLastLeaveBefore(leave.userId),
          {
            leaveTypeId: leave.leaveType.id,
            beforeDate: new Date(leave.startDate).toISOString(),
          },
          { signal: controller.signal }
          // authHeader()
        );
        // ทดสอบ response
        // console.log("Last Leave Details:", res.data);
        const payload = res?.data?.data ?? res?.data ?? null;
        setLastLeave(payload);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      }
    };

    loadLastLeave();

    return () => {
      controller.abort();
    };
  }, [leave?.userId, leave?.leaveType?.id, leave?.startDate]);

  // useEffect ที่ 3: approver
  useEffect(() => {
    let mounted = true;
    const fetchApprover = async () => {
      try {
        if (approverCache) {
          if (mounted) setApprover(approverCache);
          return;
        }

        if (!approverCachePromise) {
          approverCachePromise = API.get(apiEndpoints.getAllApprover).then(
            (res) => res?.data?.data ?? res?.data ?? null
          );
        }

        const result = await approverCachePromise;
        approverCache = result;
        if (mounted) setApprover(result);
      } catch (err) {
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.message || err.message,
          "error"
        );
      }
    };

    fetchApprover();

    return () => {
      mounted = false;
    };
  }, []);

  //--------------------------------------------------------
  //------------------------ Approver ----------------------
  //--------------------------------------------------------

  const approverByRole = useMemo(() => {
    const byRole = {
      APPROVER_1: [],
      APPROVER_2: [],
      APPROVER_3: [],
      APPROVER_4: [],
      VERIFIER: [],
    };

    for (const a of approver || []) {
      if (!Array.isArray(a?.userRoles)) continue;
      for (const ur of a.userRoles) {
        const roleName = ur?.role?.name;
        if (roleName && byRole[roleName]) byRole[roleName].push(a);
      }
    }

    return byRole;
  }, [approver]);

  // Head of Department Case
  const approver1 = useMemo(() => {
    const list = approverByRole.APPROVER_1;
    return list.find(
      (a) =>
        departmentId != null &&
        a?.department?.id === departmentId &&
        departmentHeadId != null &&
        departmentHeadId === a?.id
    );
  }, [approverByRole, departmentId, departmentHeadId]);
  // console.log("debug approver1: ", approver1);
  // console.log("dept: ", leave.user.department.id);

  // Verifier Case
  const verifier = useMemo(() => {
    const list = approverByRole.VERIFIER;
    return list.find((a) => verifierId != null && a?.id === verifierId);
  }, [approverByRole, verifierId]);
  // console.log("debug verifier: ", verifier);

  // Approver_2 Case (สารบัญคณะ)
  const approver2 = useMemo(() => {
    const list = approverByRole.APPROVER_2;
    return list.find(
      (a) =>
        hodOrganizationId != null &&
        a?.department?.organizationId === hodOrganizationId
    );
  }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver2: ", approver2);

  // Approver_3 Case (รองคณบดี)
  const approver3 = useMemo(() => {
    const list = approverByRole.APPROVER_3;
    return list.find(
      (a) =>
        hodOrganizationId != null &&
        a?.department?.organizationId === hodOrganizationId
    );
  }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver3: ", approver3);

  // Approver_4 Case (คณบดี)
  const approver4 = useMemo(() => {
    const list = approverByRole.APPROVER_4;
    return list.find(
      (a) =>
        hodOrganizationId != null &&
        a?.department?.organizationId === hodOrganizationId
    );
  }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver4: ", approver4);

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
  } = leave ?? {};
  console.log("Debug approvalSteps: ", approvalSteps);
  

  const EXPORTABLE_LEAVE_TYPE_IDS = [1, 3, 4];
  const isFinalStatus = status === "APPROVED" || status === "REJECTED";
  const isExportableType = EXPORTABLE_LEAVE_TYPE_IDS.includes(
    Number(leaveType?.id)
  );
  const canExport = isFinalStatus && isExportableType;

  const lastStart = lastLeave?.startDate ?? null;
  const lastEnd = lastLeave?.endDate ?? null;
  const lastTotal = lastLeave?.totalDays ?? null;

  const leaveData = useMemo(() => {
    return {
      userId: leave?.userId ?? null,
      documentNumber: documentNumber || "-", //
      documentDate: documentIssuedDate || "-", //
      title: `ขอ${leaveType?.name}` || "-", //
      name: `${user?.prefixName ?? ""}${user?.firstName ?? ""} ${
        user?.lastName ?? ""
      }`.trim(), //
      position: user?.position || "-", //
      organizationId: user?.department?.organization?.id || "-", //
      personalType: user?.personnelType?.name || "-", //
      leaveType: leaveType?.name || "-", //
      reason: reason || "-", //
      description: "รายละเอียดตัวอย่าง",
      date: "2023-10-15",
      leaveTypeId: leaveType?.id || null,
      startDate: startDate, //
      endDate: endDate, //
      beforeDate: leave?.startDate ? new Date(leave.startDate).toISOString() : null,
      total: totalDays, //
      thisTime: thisTimeDays, //
      leaved: leavedDays,
      lastLeave: "/",
      lastLeaveStartDate: lastStart, //
      lastLeaveEndDate: lastEnd, //
      lastLeaveTotal: lastTotal, //,
      lastLeaveThisTime: lastLeave?.thisTimeDays || "-", //
      lastLeaved: lastLeave?.leavedDays || "-",
      contact: contact || "-", //
      phone: user?.phone || "-", //
      signature: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
      commentApprover1: leave?.leaveRequestDetails?.[0]?.comment || "โปรดพิจารณา",
      signatureApprover1: " ",
      positionApprover1: "หัวหน้าสาขา",
      DateApprover1:
        leave?.leaveRequestDetails?.[0]?.reviewedAt || new Date().toISOString(), // ดึงจากวันที่อนุมัติ
      commentApprover2: leave?.leaveRequestDetails?.[2]?.comment || "โปรดพิจารณา",
      signatureApprover2: " ",
      positionApprover2: "สารบรรณคณะวิศวกรรมศาสตร์",
      DateApprover2:
        leave?.leaveRequestDetails?.[2]?.reviewedAt || new Date().toISOString(),
      commentApprover3: leave?.leaveRequestDetails?.[3]?.comment || "โปรดพิจารณา",
      signatureApprover3: " ",
      positionApprover3: "รองคณบดี",
      DateApprover3:
        leave?.leaveRequestDetails?.[3]?.reviewedAt || new Date().toISOString(),
      signatureVerifier: " ",
      DateVerifier: leave?.documentIssuedDate,
      isApprove: (leave?.leaveRequestDetails?.[1]?.status ?? null) === "APPROVED" || 
        leave?.leaveRequestDetails?.[0]?.remarks === "บันทึกโดยผู้ดูแลระบบ", 
      commentApprover4: leave?.leaveRequestDetails?.[4]?.comment || "โปรดพิจารณา",
      signatureApprover4: " ",
      DateApprover4:
        leave?.leaveRequestDetails?.[4]?.reviewedAt || new Date().toISOString(),
      // leaveDetails: leave?.leaveRequestDetails,   --> แค่ log เพื่อดูผล
    };
  }, [
    contact,
    documentIssuedDate,
    documentNumber,
    leave?.userId,
    endDate,
    lastEnd,
    lastStart,
    lastTotal,
    lastLeave?.leavedDays,
    lastLeave?.thisTimeDays,
    leavedDays,
    leave,
    leaveType?.id,
    leaveType?.name,
    reason,
    startDate,
    thisTimeDays,
    totalDays,
    user?.department?.organization?.id,
    user?.firstName,
    user?.lastName,
    user?.personnelType?.name,
    user?.phone,
    user?.position,
    user?.prefixName,
  ]);

  // console.log("Debug Leave Data: ", leaveData);
  // console.log("Debug Leave: ", leave);

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
  //------------------------ leave data ----------------------
  //--------------------------------------------------------

  // console.log("Leave Request Details:", leave);
  // console.log("Prepared Leave Data for Report:", leaveData);
  // console.log("Debug isApprove: ", leaveData.isApprove);

  const downloadReport = async () => {
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  const getApproverPositionName = (step) => {
    // ถ้า backend ส่ง roleName มาด้วย (แนะนำที่สุด)
    const roleName = step?.approver?.userRoles?.[0]?.role?.name;

    switch (roleName) {
      case "APPROVER_1":
        return "ผู้บังคับบัญชาขั้นต้น";
      case "APPROVER_2":
        return "ผู้บังคับบัญชา";
      case "APPROVER_3":
        return "ผู้บังคับบัญชา";
      case "VERIFIER":
        return "เจ้าหน้าที่ผู้รับผิดชอบงานบริหารงาน";
      case "APPROVER_4":
        return "คณบดี";
      default:
        return "-";
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

        <div className="mt-8 p-2">
          <h2 className="font-semibold text-lg mb-2">
            ความคิดเห็นผู้บังคับบัญชา
          </h2>
          {approvalSteps?.length > 0 ? (
            approvalSteps.map((step, i) => (
              <div>
                <div
                  key={i}
                  className="bg-white border px-4 py-2 rounded-lg mb-2 w-1/2"
                >
                  <div className="p-2 rounded flex items-center gap-2 bg-gray-100 overflow-hidden">
                    <p className="text-sm">
                      {step.comment ? step.comment : "-"}
                    </p>
                  </div>
                  <p className="text-sm mt-1">
                    ชื่อผู้บังคับบัญชา: {step.approver?.prefixName}{step.approver?.firstName} {step.approver?.lastName}
                  </p>
                  <p className="text-sm mt-1">
                    ตำแหน่ง: 
                  </p>
                  <p className="text-sm mt-1">
                    {step.reviewedAt ? formatDate(step.reviewedAt) : "-"}
                  </p>
                  <div className="flex items-center">
                    <p className="text-sm mt-1">
                      หมายเหตุ: {step.remarks ? step.remarks : "-"}
                    </p>
                    <p className="text-sm text-gray-600 italic mt-1 ml-auto">
                      สถานะ: {step.status}
                    </p>
                  </div>
                </div>
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
            disabled={downloading || !canExport}
            className={`px-4 py-2 rounded text-white font-medium transition
              ${canExport
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {downloading ? "กำลังดาวน์โหลด..." : "ส่งออก PDF"}
          </button>
        </div>

        {/* message notice case pending */}
        {!canExport && !isFinalStatus && (
          <p className="mt-3 text-sm text-red-500 text-center sm:text-left">
            หมายเหตุ: กระบวนการอนุมัติใบลายังไม่เสร็จสิ้น จึงไม่สามารถส่งออก PDF ได้
            กรุณารอให้ใบลาได้รับการอนุมัติหรือถูกปฏิเสธก่อน
          </p>
        )}

        {!canExport && isFinalStatus && !isExportableType && (
          <p className="mt-3 text-sm text-red-500 text-center sm:text-left">
            หมายเหตุ: ประเภทการลานี้ไม่รองรับการส่งออก PDF
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
