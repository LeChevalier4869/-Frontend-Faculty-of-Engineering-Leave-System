import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaFileAlt } from "react-icons/fa";
import axios from "axios";
import PropTypes from "prop-types";
import { apiEndpoints, API } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";


export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [lastLeave, setLastLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
    // leaveRequestDetails,
    files,
    approvalSteps,
  } = leave ?? {};

  // Move sortedApprovalSteps here to fix hoisting issue
  const sortedApprovalSteps = useMemo(() => {
    const steps = Array.isArray(approvalSteps) ? [...approvalSteps] : [];
    steps.sort((a, b) => (Number(a?.stepOrder) || 0) - (Number(b?.stepOrder) || 0));
    return steps;
  }, [approvalSteps]);

  // useEffect ที่ 1: โหลดข้อมูล leave ตาม id (ใบปัจจุบัน)
  useEffect(() => {
    const controller = new AbortController();

    const loadLeave = async () => {
      // เริ่มโหลดใหม่ทุกครั้งที่ id เปลี่ยน ไม่งั้นจะค้างสถานะเดิมของใบก่อนหน้า
      setLoading(true);
      setLeave(null);

      try {
        const res = await API.get(
          apiEndpoints.getLeaveById(id),
          { signal: controller.signal }
        );
        const payload = res?.data?.data ?? res?.data ?? null;
        setLeave(payload);
        setLoading(false);
      } catch (err) {
        // axios ยกเลิก request ด้วย CanceledError (code ERR_CANCELED) ไม่ใช่ AbortError
        // ถ้าเช็คชื่อผิด จะเผลอปิด loading ของ request ที่ถูกยกเลิก
        // ทำให้หน้าจอขึ้น "ไม่พบข้อมูลการลา" ทั้งที่ request จริงยังโหลดอยู่
        if (axios.isCancel(err) || err.code === "ERR_CANCELED") return;

        console.error("Error loading leave:", err);
        setLoading(false);
      }
    };

    loadLeave();

    return () => {
      controller.abort();
    };
  }, [id]);

  // useEffect ที่ 2: โหลดข้อมูล lastLeave (ใบลาก่อนหน้า)
  useEffect(() => {
    const controller = new AbortController();
    const loadLastLeave = async () => {
      try {
        if (!leave?.userId || !leave?.leaveType?.id || !leave?.startDate) return;
        // endpoint นี้เป็น POST และต้องการ leaveTypeId/beforeDate ใน body
        // เดิมเรียกเป็น GET เปล่า ๆ จึงได้ 404 เสมอ ทำให้ "ครั้งสุดท้ายเมื่อ" ขึ้น "-" ตลอด
        const res = await API.post(
          apiEndpoints.getLastLeaveBefore(leave.userId),
          {
            leaveTypeId: leave.leaveType.id,
            beforeDate: leave.startDate,
          },
          { signal: controller.signal }
        );
        const payload = res?.data?.data ?? res?.data ?? null;
        setLastLeave(payload);
      } catch (err) {
        if (axios.isCancel(err) || err.code === "ERR_CANCELED") return;
        console.error("Error loading last leave:", err);
      }
    };

    loadLastLeave();

    return () => {
      controller.abort();
    };
  }, [leave?.userId, leave?.leaveType?.id, leave?.startDate]);
  // Head of Department Case
  // const approver1 = useMemo(() => {
  //   const list = approverByRole.APPROVER_1;
  //   return list.find(
  //     (a) =>
  //       departmentId != null &&
  //       a?.department?.id === departmentId &&
  //       departmentHeadId != null &&
  //       departmentHeadId === a?.id
  //   );
  // }, [approverByRole, departmentId, departmentHeadId]);
  // console.log("debug approver1: ", approver1);
  // console.log("dept: ", leave.user.department.id);

  // Verifier Case
  // const verifier = useMemo(() => {
  //   const list = approverByRole.VERIFIER;
  //   return list.find((a) => verifierId != null && a?.id === verifierId);
  // }, [approverByRole, verifierId]);
  // console.log("debug verifier: ", verifier);

  // Approver_2 Case (สารบัญคณะ)
  // const approver2 = useMemo(() => {
  //   const list = approverByRole.APPROVER_2;
  //   return list.find(
  //     (a) =>
  //       hodOrganizationId != null &&
  //       a?.department?.organizationId === hodOrganizationId
  //   );
  // }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver2: ", approver2);

  // Approver_3 Case (รองคณบดี)
  // const approver3 = useMemo(() => {
  //   const list = approverByRole.APPROVER_3;
  //   return list.find(
  //     (a) =>
  //       hodOrganizationId != null &&
  //       a?.department?.organizationId === hodOrganizationId
  //   );
  // }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver3: ", approver3);

  // Approver_4 Case (คณบดี)
  // const approver4 = useMemo(() => {
  //   const list = approverByRole.APPROVER_4;
  //   return list.find(
  //     (a) =>
  //       hodOrganizationId != null &&
  //       a?.department?.organizationId === hodOrganizationId
  //   );
  // }, [approverByRole, hodOrganizationId]);
  // console.log("debig approver4: ", approver4);

  

  const EXPORTABLE_LEAVE_TYPE_IDS = [1, 3, 4];
  const isFinalStatus = status === "APPROVED" || status === "REJECTED" || status === "CANCELLED";
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
      title: `ขอ${leaveType?.name || ""}`, //
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
    return <LoadingSpinner message="กำลังโหลด..." fullScreen={false} />;
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

  // ตำแหน่งในสายอนุมัติยึดตาม "ขั้น" (stepOrder) ไม่ใช่ role ของบุคคล
  // ผู้ใช้บางคนถือหลาย role (เช่นเป็นทั้งผู้ตรวจสอบและคณบดี) การอ่านจาก role
  // จึงหยิบมาผิดขั้น แล้วโชว์ตำแหน่งไม่ตรงกับหน้าที่ในขั้นนั้น
  const POSITION_BY_STEP = {
    1: "หัวหน้าสาขา", // APPROVER_1
    2: "ผู้ตรวจสอบ", // VERIFIER
    4: "สารบรรณคณะ", // APPROVER_2
    5: "รองคณบดี", // APPROVER_3
    6: "คณบดี", // APPROVER_4
  };

  const POSITION_BY_ROLE = {
    APPROVER_1: "หัวหน้าสาขา",
    VERIFIER: "ผู้ตรวจสอบ",
    APPROVER_2: "สารบรรณคณะ",
    APPROVER_3: "รองคณบดี",
    APPROVER_4: "คณบดี",
  };

  const getApproverPositionName = (step) => {
    // 1) ยึดตามขั้นของสายอนุมัติเป็นหลัก
    const byStep = POSITION_BY_STEP[Number(step?.stepOrder)];
    if (byStep) return byStep;

    // 2) เผื่อ stepOrder ไม่มา ค่อย fallback ไปดู role ของผู้อนุมัติ
    const roleName = Array.isArray(step?.approver?.userRoles)
      ? step.approver.userRoles
          .map((ur) => ur?.role)
          .filter((r) => r?.id != null && r.id >= 3 && r.id <= 7)
          .map((r) => r?.name)
          .filter(Boolean)[0]
      : null;

    return POSITION_BY_ROLE[roleName] || "-";
  };


  const statusMeta = {
    APPROVED: { label: "อนุมัติแล้ว", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    REJECTED: { label: "ไม่อนุมัติ", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    CANCELLED: { label: "ยกเลิกแล้ว", cls: "bg-slate-100 text-slate-600 border-slate-200" },
    PENDING: { label: "รออนุมัติ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  }[status] || { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };

  const stepStatusMeta = (s) =>
    ({
      APPROVED: { label: "อนุมัติ", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
      REJECTED: { label: "ปฏิเสธ", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
      PENDING: { label: "รอดำเนินการ", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    }[s] || { label: s || "-", cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-300" });

  const hasLastLeave = !!(lastLeave?.startDate || lastLeave?.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1">
              <FaFileAlt className="text-brand-600" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">Leave Detail</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              ขอ{leaveType?.name || "ลา"}
            </h1>
            {/* เลขที่ใบลา — เน้นให้เห็นชัด เป็นข้อมูลอ้างอิงหลักของเอกสาร */}
            <div className="mt-3 inline-flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-brand-700/70">
                เลขที่ใบลา
              </span>
              <span className="text-lg font-bold tracking-wide text-brand-700">
                {documentNumber || "— ยังไม่ออกเลข"}
              </span>
              {documentIssuedDate && (
                <span className="border-l border-brand-200 pl-2.5 text-xs text-slate-500">
                  {formatDate(documentIssuedDate)}
                </span>
              )}
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>
        </div>

        {/* ---------- ผู้ยื่นคำขอ ---------- */}
        <Section title="ผู้ยื่นคำขอ">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="ชื่อ-นามสกุล" value={`${user?.prefixName || ""}${user?.firstName || ""} ${user?.lastName || ""}`.trim()} />
            <Field label="ตำแหน่ง" value={user?.position} />
            <Field label="สังกัด" value={user?.department?.organization?.name} />
            <Field label="ประเภทบุคลากร" value={user?.personnelType?.name} />
            <Field label="เบอร์โทรศัพท์" value={user?.phone} />
            <Field label="ช่องทางติดต่อ" value={contact} />
          </div>
        </Section>

        {/* ---------- รายละเอียดการลา ---------- */}
        <Section title="รายละเอียดการลา">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="ประเภทการลา" value={leaveType?.name} />
            <Field label="เรียน" value="คณบดี/ผู้อำนวยการสำนักงานวิทยาเขตขอนแก่น" />
            <Field label="วันที่ลา" value={`${formatDate(startDate)}${formatDate(startDate) !== formatDate(endDate) ? ` ถึง ${formatDate(endDate)}` : ""}`} />
            <Field label="จำนวนวันลา" value={thisTimeDays != null ? `${thisTimeDays} วัน` : "-"} />
            <div className="sm:col-span-2">
              <Field label="เหตุผลการลา" value={reason} />
            </div>
          </div>
        </Section>

        {/* ---------- การลาครั้งก่อน ---------- */}
        {hasLastLeave && (
          <Section title={`การลา${leaveType?.name || ""}ครั้งก่อน`}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Field label="ตั้งแต่" value={lastLeave?.startDate ? formatDate(lastLeave.startDate) : "-"} />
              <Field label="ถึง" value={lastLeave?.endDate ? formatDate(lastLeave.endDate) : "-"} />
              <Field label="จำนวนวัน" value={lastLeave?.thisTimeDays != null ? `${lastLeave.thisTimeDays} วัน` : "-"} />
            </div>
          </Section>
        )}

        {/* ---------- ขั้นตอนการอนุมัติ ---------- */}
        <Section title="ขั้นตอนการอนุมัติ">
          {sortedApprovalSteps.length > 0 ? (
            <ol className="space-y-3">
              {sortedApprovalSteps.map((step, i) => {
                const meta = stepStatusMeta(step.status);
                const approverName = `${step.approver?.prefixName || ""}${step.approver?.firstName || ""} ${step.approver?.lastName || ""}`.trim();
                return (
                  <li
                    key={step?.id ?? `${step?.stepOrder ?? ""}-${i}`}
                    className="relative rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {approverName || "— ยังไม่มีผู้อนุมัติ"}
                          </p>
                          <p className="text-xs text-slate-500">{getApproverPositionName(step)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    {step.comment && step.comment !== "-" && (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {step.comment}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {step.reviewedAt && <span>เมื่อ {formatDate(step.reviewedAt)}</span>}
                      {step.remarks && step.remarks !== "-" && <span>หมายเหตุ: {step.remarks}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">ยังไม่มีขั้นตอนการอนุมัติ</p>
          )}
        </Section>

        {/* ---------- ไฟล์แนบ ---------- */}
        {files?.length > 0 && (
          <Section title="ไฟล์แนบ">
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 transition hover:bg-brand-50"
                  >
                    <FaFileAlt className="text-slate-400" />
                    เอกสารแนบ {file.type}
                    {file.name && (
                      <span className="text-slate-400">
                        ({file.name.length > 50 ? file.name.substring(0, 50) + "..." : file.name})
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ---------- ปุ่มดำเนินการ ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← ย้อนกลับ
          </button>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              onClick={canExport ? downloadReport : undefined}
              disabled={downloading || !canExport}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                canExport ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {downloading ? "กำลังดาวน์โหลด..." : "ส่งออก PDF"}
            </button>
            {!canExport && !isFinalStatus && (
              <p className="text-xs text-slate-500 sm:text-right">
                ส่งออก PDF ได้เมื่อใบลาได้รับการอนุมัติหรือถูกปฏิเสธแล้ว
              </p>
            )}
            {!canExport && isFinalStatus && !isExportableType && (
              <p className="text-xs text-slate-500 sm:text-right">
                ประเภทการลานี้ไม่รองรับการส่งออก PDF
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Field({ label, value }) {
  const display = value === null || value === undefined || value === "" ? "-" : value;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">{display}</dd>
    </div>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-"; // กันวันที่ไม่ถูกต้อง ไม่ให้ render พัง
  const day = date.getDate();
  const month = date.toLocaleDateString("th-TH", { month: "long" });
  const year = date.getFullYear() + 543;

  return `วันที่ ${day} ${month} พ.ศ. ${year}`;
};
