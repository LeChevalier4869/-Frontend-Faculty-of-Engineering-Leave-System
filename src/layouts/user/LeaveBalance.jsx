import React, { useMemo, useState, useEffect } from "react";
import {
  Briefcase,
  HeartPulse,
  User,
  Baby,
  Church,
  GraduationCap,
  Accessibility,
  Flag,
  TreePalm,
  Globe,
  HeartHandshake,
  PenSquare,
  ShieldCheck,
  CalendarMinus,
  CalendarDays,
} from "lucide-react";
import axios from "axios";
import Swal from "../../utils/alert";
import { apiEndpoints } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import {
  filterLeaveBalancesBySex,
  filterLeaveBalancesLatestYear,
  isSelfServiceLeaveType,
} from "../../utils/leavePolicy";
import {
  formatLeaveDaysByUnit,
  leaveUnitForMaxDays,
} from "../../utils/formatLeaveDays";
import LoadingSpinner from "../../components/LoadingSpinner";

// ประเภทที่ "ไม่หักวันลา" (นับจำนวนวันที่ลาเฉย ๆ) — ยึดคอลัมน์ isNonDeductible จาก API เป็นหลัก
// ถ้า API ไม่ได้ส่งค่ามา (ข้อมูลเก่า) ค่อย fallback เดาจากยอดเป็น 0 ทั้งคู่
const isBalanceNonDeductible = (item) => {
  const flag = item?.leaveType?.isNonDeductible;
  if (typeof flag === "boolean") return flag;
  return item?.maxDays === 0 && item?.remainingDays === 0;
};

export default function LeaveBalancePage() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const visibleEntitlements = useMemo(() => {
    const filtered = filterLeaveBalancesBySex(entitlements, user?.sex);
    // ดึงปีปัจจุบันจากข้อมูลที่กรองแล้ว
    const currentYear = filtered.length > 0 ? filtered[0]?.year : null;
    return { data: filtered, year: currentYear };
  }, [entitlements, user?.sex]);

  // แบ่งกลุ่ม: (1) ยื่นเองในระบบได้ (ลาป่วย/ลากิจ/ลาพักผ่อน)
  // (2) ประเภทอื่นที่แอดมินกรอกให้ — แยกย่อยเป็น "หักวันลา" กับ "นับวัน (ไม่หักวันลา)"
  const { selfServiceItems, otherDeductibleItems, otherNonDeductibleItems } =
    useMemo(() => {
      const selfService = [];
      const otherDeductible = [];
      const otherNonDeductible = [];
      visibleEntitlements.data.forEach((item) => {
        if (isSelfServiceLeaveType(item.leaveType?.name)) {
          selfService.push(item);
        } else if (isBalanceNonDeductible(item)) {
          otherNonDeductible.push(item);
        } else {
          otherDeductible.push(item);
        }
      });
      return {
        selfServiceItems: selfService,
        otherDeductibleItems: otherDeductible,
        otherNonDeductibleItems: otherNonDeductible,
      };
    }, [visibleEntitlements.data]);

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
    ลาอุปสมบท: (
      <Church className="w-10 h-10 md:w-12 md:h-12 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
    ),
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: (
      <Flag className="w-10 h-10 md:w-12 md:h-12 text-brand-500 drop-shadow-[0_0_12px_rgba(122,27,34,0.6)]" />
    ),
    "ลาไปศึกษา": (
      <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 drop-shadow-[0_0_12px_rgba(79,70,229,0.6)]" />
    ),
    "ลาไปฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน": (
      <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-teal-500 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
    ),
    "ไปราชการ": (
      <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
    ),
    "ลาไปช่วยเหลือภริยาที่คลอดบุตร": (
      <HeartHandshake className="w-10 h-10 md:w-12 md:h-12 text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.6)]" />
    ),
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: (
      <Accessibility className="w-10 h-10 md:w-12 md:h-12 text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
    ),
    ลาไปประกอบพิธีฮัจย์: (
      <Church className="w-10 h-10 md:w-12 md:h-12 text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
    ),
    "ลาไปปฏิบัติงานในองค์การระหว่างประเทศ": (
      <Globe className="w-10 h-10 md:w-12 md:h-12 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
    ),
    "ลาติดตามคู่สมรส": (
      <HeartHandshake className="w-10 h-10 md:w-12 md:h-12 text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.6)]" />
    ),
  };

  const ringColorMap = {
    ลาป่วย: "ring-rose-200 bg-rose-50",
    ลาคลอดบุตร: "ring-pink-200 bg-pink-50",
    ลากิจส่วนตัว: "ring-slate-200 bg-slate-50",
    ลาพักผ่อน: "ring-amber-200 bg-amber-50",
    ลาอุปสมบท: "ring-purple-200 bg-purple-50",
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: "ring-brand-200 bg-brand-50",
    "ลาไปศึกษา": "ring-indigo-200 bg-indigo-50",
    "ลาไปฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน": "ring-teal-200 bg-teal-50",
    "ไปราชการ": "ring-amber-200 bg-amber-50",
    "ลาไปช่วยเหลือภริยาที่คลอดบุตร": "ring-rose-200 bg-rose-50",
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: "ring-emerald-200 bg-emerald-50",
    ลาไปประกอบพิธีฮัจย์: "ring-purple-200 bg-purple-50",
    "ลาไปปฏิบัติงานในองค์การระหว่างประเทศ": "ring-blue-200 bg-blue-50",
    "ลาติดตามคู่สมรส": "ring-rose-200 bg-rose-50",
  };

  const renderCard = (item, index) => {
    const type = item.leaveType?.name ?? "ไม่ระบุ";
    const total = item.maxDays ?? 0;
    const used = item.usedDays ?? 0;
    const pending = item.pendingDays ?? 0;

    // หน่วยแสดงผลของประเภทการลานี้: เกิน 1 ปี → "ปี", ไม่เกิน → "วัน" (ไม่มีเดือน)
    const unit = leaveUnitForMaxDays(total);

    // ตรวจสอบว่าเป็นประเภทการลาที่ไม่ต้องหักวันหรือไม่ (ยึด isNonDeductible จาก API)
    const isNonDeductible = isBalanceNonDeductible(item);

    // คำนวณข้อมูลสำหรับการแสดงผล
    const leaveInfo = {
      total,
      used,
      pending,
      remaining: item.remainingDays ?? total - used - pending,
      isUnlimited: isNonDeductible,
      hasOverused: false,
      overusedDays: 0,
    };

    // สำหรับประเภทการลาที่ไม่ต้องหักวัน: ไม่ต้องตรวจสอบการลาเกิน แต่ยังแสดงวันที่ใช้จริง
    if (!leaveInfo.isUnlimited && leaveInfo.remaining < 0) {
      leaveInfo.hasOverused = true;
      leaveInfo.overusedDays = Math.abs(leaveInfo.remaining);
    }

    const icon =
      iconMap[type] || (
        <User className="w-10 h-10 md:w-12 md:h-12 text-slate-500 drop-shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
      );
    const ringBg = ringColorMap[type] || "ring-slate-200 bg-slate-50";

    return (
      <div
        key={item.id ?? index}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="rounded-xl px-3 py-2 mb-3 border border-slate-100 bg-slate-50">
          <h3
            className={`font-semibold text-slate-900 ${
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

          <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm md:text-base text-slate-700 flex-1">
            {leaveInfo.isUnlimited ? (
              // แสดงสำหรับประเภทการลาที่ไม่ต้องหักวัน
              <div className="space-y-1">
                <p className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ไม่จำกัดวันลา
                </p>
                <div className="flex justify-between items-center">
                  <span>ใช้ไปแล้ว:</span>
                  <span className="font-semibold text-slate-900">
                    {formatLeaveDaysByUnit(leaveInfo.used, unit)}
                  </span>
                </div>
                {leaveInfo.pending > 0 && (
                  <div className="flex justify-between items-center">
                    <span>กำลังดำเนินการ:</span>
                    <span className="font-semibold text-amber-600">
                      {formatLeaveDaysByUnit(leaveInfo.pending, unit)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-slate-500">ประเภทนี้ไม่ต้องหักวันลา</p>
              </div>
            ) : (
              // แสดงปกติสำหรับประเภทการลาที่ต้องหักวัน
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span>จำนวนวันทั้งหมด:</span>
                  <span className="font-semibold text-slate-900">
                    {formatLeaveDaysByUnit(leaveInfo.total, unit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ใช้ไปแล้ว:</span>
                  <span className="font-semibold text-rose-600">
                    {formatLeaveDaysByUnit(leaveInfo.used, unit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>กำลังดำเนินการ:</span>
                  <span className="font-semibold text-amber-600">
                    {formatLeaveDaysByUnit(leaveInfo.pending, unit)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-1">
                  <span className="font-medium">คงเหลือ:</span>
                  <span
                    className={`font-bold ${
                      leaveInfo.hasOverused ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {leaveInfo.hasOverused
                      ? `เกิน ${formatLeaveDaysByUnit(leaveInfo.overusedDays, unit)}`
                      : formatLeaveDaysByUnit(leaveInfo.remaining, unit)}
                  </span>
                </div>
                {leaveInfo.hasOverused && (
                  <p className="text-xs text-rose-500 italic">
                    ⚠️ ลาเกินวันที่ได้รับอนุญาต
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = ({ title, subtitle, badge, accent, items }) => {
    if (!items.length) return null;
    return (
      <section className="mb-8 md:mb-10">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.iconBg} ${accent.iconText} ring-1 ${accent.ring}`}
            >
              {badge}
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                {title}
              </h2>
              <p className="text-xs md:text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-medium ${accent.chipBg} ${accent.chipText}`}
          >
            {items.length} ประเภท
          </span>
        </div>
        {renderCardGrid(items)}
      </section>
    );
  };

  const renderCardGrid = (items) => (
    <div
      className="grid gap-5 md:gap-6"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
    >
      {items.map((item, index) => renderCard(item, index))}
    </div>
  );

  // กลุ่มย่อยภายใต้ "ประเภทลาอื่น ๆ" (หัวข้อเล็กกว่า section หลัก)
  const renderSubSection = ({ title, subtitle, badge, accent, items }) => {
    if (!items.length) return null;
    return (
      <div className="mb-6 last:mb-0">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.iconBg} ${accent.iconText} ring-1 ${accent.ring}`}
            >
              {badge}
            </span>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-slate-800">
                {title}
              </h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <span
            className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.chipBg} ${accent.chipText}`}
          >
            {items.length} ประเภท
          </span>
        </div>
        {renderCardGrid(items)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <LoadingSpinner message="กำลังโหลดข้อมูลสิทธิลาการลา..." fullScreen={false} />
    );
  }

  if (visibleEntitlements.data.length === 0) {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-700">
              Leave Balance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            ยอดวันลาคงเหลือของคุณ
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            ตรวจสอบสิทธิการลาทั้งหมดของคุณในแต่ละประเภทการลา
          </p>
          {visibleEntitlements.year && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-xs font-medium text-emerald-700">
                ปี {visibleEntitlements.year}
              </span>
            </div>
          )}
        </div>

        {renderSection({
          title: "ยื่นลาได้เองในระบบ",
          subtitle: "ลาป่วย ลากิจส่วนตัว ลาพักผ่อน — ยื่นคำขอผ่านระบบได้ด้วยตนเอง",
          badge: <PenSquare className="h-5 w-5" />,
          accent: {
            iconBg: "bg-brand-50",
            iconText: "text-brand-600",
            ring: "ring-brand-200",
            chipBg: "bg-brand-50",
            chipText: "text-brand-700",
          },
          items: selfServiceItems,
        })}

        {(otherDeductibleItems.length > 0 ||
          otherNonDeductibleItems.length > 0) && (
          <section className="mb-8 md:mb-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  ประเภทลาอื่น ๆ
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  ผู้ดูแล (แอดมิน) เป็นผู้บันทึกข้อมูลการลาให้ ไม่สามารถยื่นเองในระบบ
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 md:p-5">
              {renderSubSection({
                title: "ประเภทที่หักวันลา",
                subtitle: "มีสิทธิ์เป็นจำนวนวัน และตัดยอดคงเหลือเมื่อใช้สิทธิ์",
                badge: <CalendarMinus className="h-4 w-4" />,
                accent: {
                  iconBg: "bg-rose-50",
                  iconText: "text-rose-600",
                  ring: "ring-rose-200",
                  chipBg: "bg-rose-50",
                  chipText: "text-rose-700",
                },
                items: otherDeductibleItems,
              })}

              {otherDeductibleItems.length > 0 &&
                otherNonDeductibleItems.length > 0 && (
                  <div className="my-5 border-t border-dashed border-slate-200" />
                )}

              {renderSubSection({
                title: "ประเภทที่นับวัน (ไม่หักวันลา)",
                subtitle: "ไม่จำกัดวันลา บันทึกเฉพาะจำนวนวันที่ใช้ไป",
                badge: <CalendarDays className="h-4 w-4" />,
                accent: {
                  iconBg: "bg-emerald-50",
                  iconText: "text-emerald-600",
                  ring: "ring-emerald-200",
                  chipBg: "bg-emerald-50",
                  chipText: "text-emerald-700",
                },
                items: otherNonDeductibleItems,
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
