import LeaveApproverBase from "./LeaveApproverBase";
import { apiEndpoints } from "../../utils/api";

// ผู้ตรวจสอบ (VERIFIER) — ใช้หน้าเดียวกับผู้อนุมัติคนอื่น แต่ปรับให้เข้ากับบทบาท:
//  - รับเอกสารต่อจากหัวหน้าสาขา (APPROVER_1) โดยปกติจะให้ "ผ่าน"
//    ยกเว้นพบสิ่งผิดปกติจึงให้ "ไม่ผ่าน" — จึงใช้คำว่า ผ่าน/ไม่ผ่าน แทน อนุมัติ/ปฏิเสธ
//  - ผู้ตรวจสอบไม่ระบุความคิดเห็น (ในเอกสารกระดาษทำหน้าที่แค่ลงชื่อในฐานะผู้ตรวจสอบ)
export default function LeaveVerifier() {
  return (
    <LeaveApproverBase
      listUrl={apiEndpoints.leaveRequestForVerifier}
      approveUrl={apiEndpoints.ApproveleaveRequestsByVerifier}
      rejectUrl={apiEndpoints.RejectleaveRequestsByVerifier}
      approveLabel="ผ่าน"
      rejectLabel="ไม่ผ่าน"
      showComment={false}
      approveRemark="ผ่านการตรวจสอบ"
      rejectRemark="ไม่ผ่านการตรวจสอบ"
      title="รายการการลารอตรวจสอบ"
      subtitle="ตรวจรับเอกสารการลาต่อจากหัวหน้าสาขา แล้วระบุผลว่า ผ่าน หรือ ไม่ผ่าน การตรวจสอบ"
    />
  );
}
