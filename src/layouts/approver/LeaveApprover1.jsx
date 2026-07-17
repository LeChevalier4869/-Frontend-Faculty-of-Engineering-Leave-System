import LeaveApproverBase from "./LeaveApproverBase";
import { apiEndpoints } from "../../utils/api";

// ผู้อนุมัติระดับ 1 (หัวหน้าหน่วยงาน) — ใช้ component กลาง LeaveApproverBase
export default function LeaveApprover1() {
  return (
    <LeaveApproverBase
      listUrl={apiEndpoints.leaveRequestForFirstApprover}
      approveUrl={apiEndpoints.ApproveleaveRequestsByFirstApprover}
      rejectUrl={apiEndpoints.RejectleaveRequestsByFirstApprover}
    />
  );
}
