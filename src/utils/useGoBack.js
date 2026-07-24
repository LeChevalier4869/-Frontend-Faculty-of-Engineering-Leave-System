import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ปุ่ม "ย้อนกลับ" แบบ undo: ถอยไปหน้าก่อนหน้าใน history ของเบราว์เซอร์
 * ถ้าไม่มีประวัติให้ถอย (เปิดลิงก์ตรง ๆ หรือแท็บใหม่) จะไปที่ fallback แทน
 *
 * React Router เก็บลำดับ history ไว้ที่ window.history.state.idx โดยหน้าแรกสุด
 * ที่เข้ามาจะเป็น idx = 0 (ยังไม่มีอะไรให้ถอย) จึงใช้ค่านี้ตัดสิน
 *
 *   const goBack = useGoBack("/admin/manage-user");
 *   <button onClick={goBack}>← ย้อนกลับ</button>
 */
export function useGoBack(fallback = "/") {
  const navigate = useNavigate();

  return useCallback(() => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, fallback]);
}

export default useGoBack;
