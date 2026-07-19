import LeaveApproverBase from "./LeaveApproverBase";
import { apiEndpoints } from "../../utils/api";

// ผู้อนุมัติระดับ 3 (APPROVER_3) — ใช้ component กลาง LeaveApproverBase
export default function LeaveApprover3() {
  return (
    <LeaveApproverBase
      listUrl={apiEndpoints.leaveRequestForThirdApprover}
      approveUrl={apiEndpoints.ApproveleaveRequestsByThirdApprover}
      rejectUrl={apiEndpoints.RejectleaveRequestsByThirdApprover}
    />
  );
}
