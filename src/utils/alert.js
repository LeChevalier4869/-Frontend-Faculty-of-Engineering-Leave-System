import Swal from "sweetalert2";

/**
 * Swal ที่ตั้งค่าเริ่มต้นให้ "เหมือนกันทั้งระบบ":
 * - ฟอนต์ไทย (Kanit) + มุมโค้ง
 * - กดนอกกล่องเพื่อปิดได้ (allowOutsideClick)
 * ใช้แทน `Swal` ปกติ หรือใช้ helper ด้านล่างเพื่อความสม่ำเสมอ
 */
const AppSwal = Swal.mixin({
  allowOutsideClick: true,
  buttonsStyling: true,
  customClass: {
    popup: "font-kanit rounded-2xl",
    confirmButton: "font-kanit",
    cancelButton: "font-kanit",
  },
});

// แจ้งสำเร็จ — ปิดเองอัตโนมัติ (แนวเดียวกับป็อปอัพยื่นลา)
export const notifySuccess = (title, text = "") =>
  AppSwal.fire({
    icon: "success",
    title,
    text,
    timer: 1600,
    timerProgressBar: true,
    showConfirmButton: false,
  });

// แจ้งข้อผิดพลาด — มีปุ่มปิด
export const notifyError = (title, text = "") =>
  AppSwal.fire({ icon: "error", title, text, confirmButtonColor: "#ef4444" });

// แจ้งเตือนทั่วไป (warning/info)
export const notify = (icon, title, text = "") =>
  AppSwal.fire({ icon, title, text });

/**
 * กล่องยืนยันการกระทำ — คืนค่า boolean (true = กดยืนยัน)
 * ตั้ง danger: true สำหรับการลบ/รีเซ็ต (ปุ่มยืนยันสีแดง)
 */
export const confirmAction = ({
  title,
  text = "",
  html = undefined,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  icon = "warning",
  danger = false,
}) =>
  AppSwal.fire({
    title,
    text: html ? undefined : text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#dc2626" : "#7A1B22",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
  }).then((r) => r.isConfirmed);

export default AppSwal;
