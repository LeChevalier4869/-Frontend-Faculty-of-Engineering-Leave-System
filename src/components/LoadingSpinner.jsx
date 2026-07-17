import React from "react";

/**
 * Shared Loading Spinner Component
 * ใช้สำหรับแสดงสถานะการณ์การโหลดข้อมูลทั่วหมด
 */
export default function LoadingSpinner({
  message = "กำลังโหลดข้อมูล...",
  size = "md",
  fullScreen = true
}) {
  // ขนาดวงแหวน ping + จุดตรงกลาง (ย่อให้กระทัดรัดขึ้น)
  const sizeClasses = {
    sm: { ring: "h-7 w-7", dot: "h-2 w-2" },
    md: { ring: "h-9 w-9", dot: "h-2.5 w-2.5" },
    lg: { ring: "h-12 w-12", dot: "h-3.5 w-3.5" },
  };
  const s = sizeClasses[size] || sizeClasses.md;

  // โหมด fullScreen = ทับทั้งจอ, โหมด in-content = กึ่งกลางพื้นที่เนื้อหา (สูงพอให้อยู่กลางแนวตั้งจริง)
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm font-kanit text-slate-800"
    : "flex items-center justify-center w-full min-h-[70vh] p-4 font-kanit text-slate-800";

  return (
    <div className={containerClasses}>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-lg px-8 py-6">
        {/* จัดกึ่งกลางแนวตั้ง: ไอคอนบน ข้อความล่าง ทุกอย่าง center */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Loading Spinner */}
          <div className={`relative flex ${s.ring} items-center justify-center`}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-200 opacity-75 animate-ping" />
            <span className={`relative inline-flex ${s.dot} rounded-full bg-brand-500 shadow-[0_0_14px_rgba(122,27,34,0.6)]`} />
          </div>

          {/* Loading Message */}
          <div>
            <span className="font-medium text-slate-800 block">{message}</span>
            <span className="text-xs text-slate-500 block mt-0.5">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
