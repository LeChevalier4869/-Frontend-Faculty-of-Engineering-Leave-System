import React, { useState, useEffect } from "react";
import {
  Briefcase,
  HeartPulse,
  User,
  Baby,
  Church,
  GraduationCap,
  Home,
  Accessibility,
  Flag,
  TreePalm,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";

export default function LeaveBalancePage() {
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบ",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        const res = await axios.get(apiEndpoints.getLeaveBalanceForMe, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(res.data.data)) {
          setEntitlements(res.data.data);
        } else {
          setEntitlements([]);
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลสิทธิลาการลาได้",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  const iconMap = {
    ลาป่วย: (
      <HeartPulse className="w-10 h-10 md:w-12 md:h-12 text-rose-300 drop-shadow-[0_0_18px_rgba(248,113,113,0.8)]" />
    ),
    ลาคลอดบุตร: (
      <Baby className="w-10 h-10 md:w-12 md:h-12 text-pink-300 drop-shadow-[0_0_18px_rgba(244,114,182,0.8)]" />
    ),
    ลากิจส่วนตัว: (
      <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-slate-200 drop-shadow-[0_0_18px_rgba(148,163,184,0.8)]" />
    ),
    ลาพักผ่อน: (
      <TreePalm className="w-10 h-10 md:w-12 md:h-12 text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.8)]" />
    ),
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: (
      <Church className="w-10 h-10 md:w-12 md:h-12 text-purple-300 drop-shadow-[0_0_18px_rgba(192,132,252,0.8)]" />
    ),
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: (
      <Flag className="w-10 h-10 md:w-12 md:h-12 text-sky-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
    ),
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา: (
      <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-indigo-300 drop-shadow-[0_0_18px_rgba(129,140,248,0.8)]" />
    ),
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: (
      <Home className="w-10 h-10 md:w-12 md:h-12 text-orange-300 drop-shadow-[0_0_18px_rgba(251,146,60,0.8)]" />
    ),
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: (
      <Accessibility className="w-10 h-10 md:w-12 md:h-12 text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
    ),
  };

  const ringColorMap = {
    ลาป่วย: "ring-rose-400/50 bg-rose-500/10",
    ลาคลอดบุตร: "ring-pink-400/50 bg-pink-500/10",
    ลากิจส่วนตัว: "ring-slate-400/50 bg-slate-500/10",
    ลาพักผ่อน: "ring-amber-400/50 bg-amber-500/10",
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: "ring-purple-400/50 bg-purple-500/10",
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: "ring-sky-400/50 bg-sky-500/10",
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา:
      "ring-indigo-400/50 bg-indigo-500/10",
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: "ring-orange-400/50 bg-orange-500/10",
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: "ring-emerald-400/50 bg-emerald-500/10",
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="text-slate-100 font-medium">
              กำลังโหลดข้อมูลสิทธิลาการลา...
            </span>
            <span className="text-xs text-slate-400">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (entitlements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100 px-4 py-8 md:px-8 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/70 border border-sky-500/25 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6 text-center">
          <p className="text-sm text-slate-300">ไม่มีข้อมูลสิทธิลาการลา</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100 px-4 py-8 md:px-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 md:mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-100">
              Leave Balance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
            ยอดวันลาคงเหลือของคุณ
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            ตรวจสอบสิทธิการลาทั้งหมดของคุณในแต่ละประเภทการลา
          </p>
        </div>

        <div
          className="grid gap-5 md:gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {entitlements.map((item, index) => {
            const type = item.leaveType?.name ?? "ไม่ระบุ";
            const total = item.maxDays ?? 0;
            const used = item.usedDays ?? 0;
            const pending = item.pendingDays ?? 0;
            const remaining = item.remainingDays ?? total - used - pending;
            const icon = iconMap[type] || (
              <User className="w-10 h-10 md:w-12 md:h-12 text-slate-200 drop-shadow-[0_0_18px_rgba(148,163,184,0.8)]" />
            );
            const ringBg =
              ringColorMap[type] ||
              "ring-slate-400/50 bg-slate-500/10";

            return (
              <div
                key={item.id ?? index}
                className="rounded-2xl bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl p-4 md:p-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div
                  className={`rounded-xl px-3 py-2 mb-3 border border-white/10 bg-slate-900/60`}
                >
                  <h3
                    className={`font-semibold text-slate-50 ${
                      type.length > 35
                        ? "text-xs sm:text-sm md:text-base"
                        : type.length > 30
                        ? "text-sm sm:text-base md:text-lg"
                        : "text-base sm:text-lg md:text-xl"
                    }`}
                  >
                    {type}
                  </h3>
                </div>

                <div className="flex items-center gap-4 md:gap-5">
                  <div
                    className={`${ringBg} p-3 sm:p-4 rounded-2xl flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 shrink-0 ring-1`}
                  >
                    {icon}
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm md:text-base text-slate-200 flex-1">
                    <p>
                      จำนวนวันทั้งหมด:{" "}
                      <span className="font-semibold text-sky-200">
                        {total}
                      </span>
                    </p>
                    <p>
                      ใช้ไปแล้ว:{" "}
                      <span className="font-semibold text-rose-300">
                        {used}
                      </span>
                    </p>
                    <p>
                      กำลังดำเนินการ:{" "}
                      <span className="font-semibold text-amber-300">
                        {pending}
                      </span>
                    </p>
                    <p>
                      เหลือ:{" "}
                      <span className="font-semibold text-emerald-300">
                        {remaining}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
