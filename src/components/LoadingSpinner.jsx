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
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-50 font-kanit text-slate-800"
    : "flex items-center justify-center p-4";

  const modalClasses = fullScreen
    ? "w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6"
    : "rounded-2xl bg-white border border-slate-200 shadow-lg p-4";

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        <div className="flex flex-col items-center gap-3 text-sm">
          {/* Loading Spinner */}
          <div className={`relative flex ${sizeClasses[size]} items-center justify-center`}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
          </div>
          
          {/* Loading Message */}
          <div className="text-center">
            <span className="font-medium">
              {message}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
