// ใบลาถูกบันทึกโดยแอดมินแทนเจ้าของหรือไม่
// - createdById มีค่า = แอดมินบันทึกให้ (ระบบบันทึกตอน createRequestByAdmin)
// - ประเภทลาที่ผู้ใช้ยื่นเองไม่ได้ (isAvailable = false) มีทางเดียวคือแอดมินยื่นให้
//   ใช้เป็น fallback สำหรับข้อมูลเก่าที่ยังไม่มี createdById
export const isSubmittedByAdmin = (leave) =>
  leave?.createdById != null ||
  leave?.createdBy?.id != null ||
  leave?.leaveType?.isAvailable === false;

// หมวดของประเภทลา: ประเภทที่ผู้ใช้ยื่นเองได้ / ประเภทอื่นๆ (แอดมินยื่นให้เท่านั้น)
export const leaveCategoryLabel = (leaveType) => {
  if (!leaveType || leaveType.isAvailable == null) return null;
  return leaveType.isAvailable ? "ประเภทลาเอง" : "ประเภทลาอื่นๆ";
};

export const creatorName = (leave) =>
  [leave?.createdBy?.prefixName, leave?.createdBy?.firstName]
    .filter(Boolean)
    .join("") +
  (leave?.createdBy?.lastName ? ` ${leave.createdBy.lastName}` : "");
