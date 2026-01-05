import React, { useMemo, useState, useEffect } from "react";
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
import useAuth from "../../hooks/useAuth";
import {
  filterLeaveBalancesBySex,
  filterLeaveBalancesLatestYear,
  formatRemainingDays,
} from "../../utils/leavePolicy";

export default function LeaveBalancePage() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const visibleEntitlements = useMemo(() => {
    return filterLeaveBalancesBySex(entitlements, user?.sex);
  }, [entitlements, user?.sex]);

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
          const latestYearOnly = filterLeaveBalancesLatestYear(res.data.data);
          setEntitlements(latestYearOnly);
          console.log("latestYearOnly", latestYearOnly);  
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
      <HeartPulse className="w-10 h-10 md:w-12 md:h-12 text-rose-500 drop-shadow-[0_0_12px_rgba(248,113,113,0.55)]" />
    ),
    ลาคลอดบุตร: (
      <Baby className="w-10 h-10 md:w-12 md:h-12 text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.55)]" />
    ),
    ลากิจส่วนตัว: (
      <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-slate-500 drop-shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
    ),
    ลาพักผ่อน: (
      <TreePalm className="w-10 h-10 md:w-12 md:h-12 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
    ),
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: (
      <Church className="w-10 h-10 md:w-12 md:h-12 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
    ),
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: (
      <Flag className="w-10 h-10 md:w-12 md:h-12 text-sky-500 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
    ),
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา: (
      <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 drop-shadow-[0_0_12px_rgba(79,70,229,0.6)]" />
    ),
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: (
      <Home className="w-10 h-10 md:w-12 md:h-12 text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
    ),
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: (
      <Accessibility className="w-10 h-10 md:w-12 md:h-12 text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
    ),
  };

  const ringColorMap = {
    ลาป่วย: "ring-rose-200 bg-rose-50",
    ลาคลอดบุตร: "ring-pink-200 bg-pink-50",
    ลากิจส่วนตัว: "ring-slate-200 bg-slate-50",
    ลาพักผ่อน: "ring-amber-200 bg-amber-50",
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: "ring-purple-200 bg-purple-50",
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: "ring-sky-200 bg-sky-50",
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา:
      "ring-indigo-200 bg-indigo-50",
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: "ring-orange-200 bg-orange-50",
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: "ring-emerald-200 bg-emerald-50",
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 text-slate-800 font-kanit">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="text-slate-800 font-medium">
              กำลังโหลดข้อมูลสิทธิลาการลา...
            </span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (visibleEntitlements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6 text-center">
          <p className="text-sm text-slate-500">ไม่มีข้อมูลสิทธิลาการลา</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-kanit px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 md:mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Leave Balance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            ยอดวันลาคงเหลือของคุณ
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            ตรวจสอบสิทธิการลาทั้งหมดของคุณในแต่ละประเภทการลา
          </p>
        </div>

        <div
          className="grid gap-5 md:gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {visibleEntitlements.map((item, index) => {
            const type = item.leaveType?.name ?? "ไม่ระบุ";
            const total = item.maxDays ?? 0;
            const used = item.usedDays ?? 0;
            const pending = item.pendingDays ?? 0;
            const remaining = item.remainingDays ?? total - used - pending;
            const remainingDisplay = formatRemainingDays(remaining);
            const icon =
              iconMap[type] || (
                <User className="w-10 h-10 md:w-12 md:h-12 text-slate-500 drop-shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
              );
            const ringBg =
              ringColorMap[type] || "ring-slate-200 bg-slate-50";

            return (
              <div
                key={item.id ?? index}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="rounded-xl px-3 py-2 mb-3 border border-slate-100 bg-slate-50">
                  <h3
                    className={`font-semibold text-slate-900 ${type.length > 35
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

                  <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm md:text-base text-slate-700 flex-1">
                    <p>
                      จำนวนวันทั้งหมด:{" "}
                      <span className="font-semibold text-slate-900">
                        {total}
                      </span>
                    </p>
                    <p>
                      ใช้ไปแล้ว:{" "}
                      <span className="font-semibold text-rose-600">
                        {used}
                      </span>
                    </p>
                    <p>
                      กำลังดำเนินการ:{" "}
                      <span className="font-semibold text-amber-600">
                        {pending}
                      </span>
                    </p>
                    <p>
                      เหลือ:{" "}
                      <span className={`font-semibold ${remainingDisplay.className}`}>
                        {remainingDisplay.text}
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
