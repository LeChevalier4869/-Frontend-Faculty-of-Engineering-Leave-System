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
    ลาป่วย: <HeartPulse className="w-12 h-12 md:w-14 md:h-14 text-red-700" />,
    ลาคลอดบุตร: <Baby className="w-12 h-12 md:w-14 md:h-14 text-pink-700" />,
    ลากิจส่วนตัว: (
      <Briefcase className="w-12 h-12 md:w-14 md:h-14 text-gray-600" />
    ),
    ลาพักผ่อน: (
      <TreePalm className="w-12 h-12 md:w-14 md:h-14 text-amber-700" />
    ),
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: (
      <Church className="w-12 h-12 md:w-14 md:h-14 text-purple-500" />
    ),
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: (
      <Flag className="w-12 h-12 md:w-14 md:h-14 text-blue-700" />
    ),
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา: (
      <GraduationCap className="w-12 h-12 md:w-14 md:h-14 text-indigo-600" />
    ),
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: (
      <Home className="w-12 h-12 md:w-14 md:h-14 text-orange-700" />
    ),
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: (
      <Accessibility className="w-12 h-12 md:w-14 md:h-14 text-green-700" />
    ),
  };

  const bgColorMap = {
    ลาป่วย: "bg-red-200",
    ลาคลอดบุตร: "bg-pink-200",
    ลากิจส่วนตัว: "bg-gray-300",
    ลาพักผ่อน: "bg-amber-200",
    ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์: "bg-purple-200",
    ลาเข้ารับการตรวจเลือกเข้ารับการเตรียมพล: "bg-blue-200",
    ลาไปเพื่อประโยชน์ในการพัฒนาพนักงานในสถาบันอุดมศึกษา: "bg-indigo-200",
    ลาไปช่วยเหลือภริยาที่คลอดบุตร: "bg-orange-200",
    ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ: "bg-green-200",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดข้อมูลสิทธิลาการลา...
      </div>
    );
  }

  if (entitlements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-400">
        ไม่มีข้อมูลสิทธิลาการลา
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 md:px-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-black-800 mb-8 sm:mb-10 text-center">
          ยอดวันลาคงเหลือ
        </h1>

        <div
          className="grid gap-4 sm:gap-6 md:gap-8"
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
              <User className="w-12 h-12 md:w-14 md:h-14 text-gray-400" />
            );
            const bgColor = bgColorMap[type] || "bg-gray-100";

            return (
              <div
                key={item.id ?? index}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 md:p-6"
              >
                <div className="bg-gray-50 rounded-md px-3 py-2 mb-3 border border-gray-200">
                  <h3
                    className={`font-semibold text-gray-800 ${
                      type.length > 25
                        ? "text-sm sm:text-base md:text-lg" // ลดขนาดถ้าเกิน 25 ตัว
                        : "text-base sm:text-lg md:text-xl" // ปกติ
                    }`}
                  >
                    {type}
                  </h3>
                </div>

                {/* Content */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <div
                    className={`${bgColor} p-3 sm:p-4 rounded-full flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 shrink-0`}
                  >
                    {icon}
                  </div>

                  <div className="text-xs sm:text-sm md:text-base text-gray-700 grid grid-cols-1 gap-1 flex-1">
                    <p>
                      จำนวนวันทั้งหมด:{" "}
                      <span className="font-semibold">{total}</span>
                    </p>
                    <p>
                      ใช้ไปแล้ว:{" "}
                      <span className="text-red-600 font-semibold">{used}</span>
                    </p>
                    <p>
                      กำลังดำเนินการ:{" "}
                      <span className="text-yellow-600 font-semibold">
                        {pending}
                      </span>
                    </p>
                    <p>
                      เหลือ:{" "}
                      <span className="text-green-600 font-semibold">
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
