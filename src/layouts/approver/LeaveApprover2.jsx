import LeaveApproverBase from "./LeaveApproverBase";
import { apiEndpoints } from "../../utils/api";

// ผู้อนุมัติระดับ 2 (APPROVER_2) — ใช้ component กลาง LeaveApproverBase
export default function LeaveApprover2() {
  return (
    <LeaveApproverBase
      listUrl={apiEndpoints.leaveRequestForSecondApprover}
      approveUrl={apiEndpoints.ApproveleaveRequestsBySecondApprover}
      rejectUrl={apiEndpoints.RejectleaveRequestsBySecondApprover}
    />
  );
}
