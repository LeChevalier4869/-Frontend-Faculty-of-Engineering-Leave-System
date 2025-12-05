import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบ",
        confirmButtonColor: "#ef4444",
      });
      return;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
    } else {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [holidayRes, leaveRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/holiday`, authHeader()),
        axios.get(
          `${BASE_URL}/leave-requests/my-requests/approved`,
          authHeader()
        ),
      ]);

      const holidayEvents = holidayRes.data.data.map((holiday) => {
        let color = "#ef4444";
        if (holiday.holidayType === "หยุดนักขัตฤกษ์") color = "#22c55e";
        else if (holiday.holidayType === "หยุดราชการพิเศษ") color = "#3b82f6";
        else if (holiday.holidayType === "วันสำคัญอื่น ๆ") color = "#a855f7";

        return {
          title: holiday.description,
          start: holiday.date,
          allDay: true,
          color,
        };
      });

      const leaveEvents = leaveRes.data.map((leave) => ({
        title: `${leave.leaveType.name}`,
        start: leave.startDate,
        end: new Date(new Date(leave.endDate).getTime() + 86400000)
          .toISOString()
          .split("T")[0],
        allDay: true,
        color: "#f59e0b",
      }));

      setEvents([...holidayEvents, ...leaveEvents]);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 text-slate-800 font-kanit">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]" />
            </div>
            <span className="font-medium">กำลังโหลดปฏิทิน...</span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูล
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-sky-700">
              Calendar
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            ปฏิทินวันหยุด & การลา
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            ตรวจสอบวันหยุดราชการ นักขัตฤกษ์ และช่วงเวลาที่คุณลางาน
          </p>
        </div>

        <Panel className="p-4 md:p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            locale={thLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
          />
        </Panel>

        <Panel className="p-4 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500 shadow" />
            <span className="text-slate-700 text-sm">หยุดนักขัตฤกษ์</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500 shadow" />
            <span className="text-slate-700 text-sm">หยุดราชการพิเศษ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-purple-500 shadow" />
            <span className="text-slate-700 text-sm">วันสำคัญอื่น ๆ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500 shadow" />
            <span className="text-slate-700 text-sm">วันลาของคุณ</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
