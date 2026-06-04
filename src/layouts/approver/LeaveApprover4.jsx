import LeaveApproverBase from "./LeaveApproverBase";
import { apiEndpoints } from "../../utils/api";

// ผู้อนุมัติระดับ 4 (APPROVER_4 — ขั้นสุดท้าย) — ใช้ component กลาง LeaveApproverBase
export default function LeaveApprover4() {
  return (
    <LeaveApproverBase
      listUrl={apiEndpoints.leaveRequestForFouthApprover}
      approveUrl={apiEndpoints.ApproveleaveRequestsByFouthApprover}
      rejectUrl={apiEndpoints.RejectleaveRequestsByFouthApprover}
    />
  );
}
