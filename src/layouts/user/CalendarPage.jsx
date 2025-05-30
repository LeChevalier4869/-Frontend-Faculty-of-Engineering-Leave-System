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
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
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
      const res = await axios.get(`${BASE_URL}/admin/holiday`, authHeader());
      const eventData = res.data.data.map((holiday) => {
        let color = "red"; // ค่าเริ่มต้น

        if (holiday.holidayType === "หยุดนักขัตฤกษ์") {
          color = "green";
        } else if (holiday.holidayType === "หยุดราชการพิเศษ") {
          color = "blue";
        } else if (holiday.holidayType === "วันสำคัญอื่น ๆ") {
          color = "purple"; // ม่วงอ่อน โทนเย็น
        }

        return {
          title: holiday.description,
          start: holiday.date,
          allDay: true,
          color,
        };
      });
      setEvents(eventData);
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
      <div className="min-h-screen flex items-center justify-center text-lg font-kanit">
        กำลังโหลด...
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
      <div className="mt-2 max-w-md mx-auto flex justify-center gap-6">
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
      </div>
    </div>
  );
}
