import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/api";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = () => {
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
    //     () => (window.location.href = "/login")
    //   );
    //   throw new Error("No token");
    // }
    // return { headers: { Authorization: `Bearer ${token}` } };
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
        ), // API ข้อมูลการลา
      ]);
      console.log("Holiday Data:", holidayRes.data);
      console.log("Leave Data:", leaveRes.data);

      // วันหยุด
      const holidayEvents = holidayRes.data.data.map((holiday) => {
        let color = "red";
        if (holiday.holidayType === "หยุดนักขัตฤกษ์") color = "green";
        else if (holiday.holidayType === "หยุดราชการพิเศษ") color = "blue";
        else if (holiday.holidayType === "วันสำคัญอื่น ๆ") color = "purple";

        return {
          title: holiday.description,
          start: holiday.date,
          allDay: true,
          color,
        };
      });

      // วันลา
      const leaveEvents = leaveRes.data.map((leave) => ({
        title: `${leave.leaveType.name}`,
        start: leave.startDate,
        end: new Date(new Date(leave.endDate).getTime() + 86400000) // บวก 1 วันเพื่อให้ FullCalendar ครอบวันสุดท้ายด้วย
          .toISOString()
          .split("T")[0],
        allDay: true,
        color: "#f59e0b", // สีส้มทอง (tailwind amber-500)
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
      <div className="min-h-screen flex items-center justify-center font-kanit text-gray-500">
        กำลังโหลดปฎิทิน...
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-white px-6 py-10 font-kanit text-black">
      <h1 className="text-4xl font-kanit font-bold text-center p-6 flex-shrink-0">
        ปฏิทินวันหยุด
      </h1>

      {/* wrapper ที่ให้เต็มพื้นที่ */}
      <div
        className="flex-grow"
        style={{ height: "calc(100vh - 160px)", overflow: "hidden" }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="100%"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          locale={thLocale} // ตั้ง locale เป็นภาษาไทย
        />
      </div>

      {/* Legend */}
      <div className="mt-2 max-w-3xl mx-auto flex flex-wrap justify-center gap-6">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-green-600 inline-block"></span>
          <span>หยุดนักขัตฤกษ์</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 inline-block"></span>
          <span>หยุดราชการพิเศษ</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-purple-600 inline-block"></span>
          <span>วันสำคัญอื่น ๆ</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-amber-500 inline-block"></span>
          <span>วันลาของคุณ</span>
        </div>
      </div>
    </div>
  );
}
