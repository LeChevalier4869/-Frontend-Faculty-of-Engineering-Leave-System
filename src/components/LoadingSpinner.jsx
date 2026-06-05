import React from "react";

/**
 * Shared Loading Spinner Component
 * ใช้สำหรับแสดงสถานะการณ์การโหลดข้อมูลทั่วหมด
 */
export default function LoadingSpinner({
  message = "กำลังโหลดข้อมูล...",
  size = "lg",
  fullScreen = true
}) {
  // ขนาดวงแหวน ping + จุดตรงกลาง (ปรับให้สมส่วนกับการ์ด)
  const sizeClasses = {
    sm: { ring: "h-10 w-10", dot: "h-3 w-3" },
    md: { ring: "h-14 w-14", dot: "h-4 w-4" },
    lg: { ring: "h-20 w-20", dot: "h-5 w-5" },
  };
  const s = sizeClasses[size] || sizeClasses.lg;

  // โหมด fullScreen = ทับทั้งจอ, โหมด in-content = กึ่งกลางพื้นที่เนื้อหา (มีความสูงให้กลางแนวตั้งจริง)
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-50 font-kanit text-slate-800"
    : "flex items-center justify-center w-full min-h-[70vh] p-4 font-kanit text-slate-800";

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-xl px-8 py-12">
        <div className="flex flex-col items-center gap-5 text-base">
          {/* Loading Spinner */}
          <div className={`relative flex ${s.ring} items-center justify-center`}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-200 opacity-75 animate-ping" />
            <span className={`relative inline-flex ${s.dot} rounded-full bg-brand-500 shadow-[0_0_24px_rgba(122,27,34,0.7)]`} />
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <span className="font-medium text-lg">
              {message}
            </span>
            <span className="text-sm text-slate-500 block mt-1.5">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
