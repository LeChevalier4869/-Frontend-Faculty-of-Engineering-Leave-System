import React, { useState, useEffect } from "react";
import { FaChartPie } from "react-icons/fa";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";

function DashBoard() {
  const [holidays, setHolidays] = useState([]);
  const year = new Date().getFullYear();

  // ดึงข้อมูลวันหยุด
  useEffect(() => {
    axios
      .get(`https://date.nager.at/api/v2/publicholidays/${year}/TH`)
      .then(({ data }) => setHolidays(data))
      .catch((err) => console.error("fetch holidays error:", err));
  }, [year]);

  // แสดงชื่อวันหยุดใต้วันที่ตรงกับ holiday.date
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const iso = date.toISOString().slice(0, 10);
      const hol = holidays.find((h) => h.date === iso);
      return hol ? (
        <div className="text-xs text-red-600 mt-1">{hol.localName}</div>
      ) : null;
    }
  };

  // ใส่คลาสให้ตัวเลขและตัวอักษรปฏิทินเป็นสีดำ
  const tileClassName = ({ view }) =>
    view === "month" ? "text-black" : "";

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-10">
          <FaChartPie className="text-black text-4xl mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            แดชบอร์ด
          </h1>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">จำนวนคำขอลา</h2>
            <p className="text-4xl mt-2 font-bold">25</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">คำขอลาที่อนุมัติ</h2>
            <p className="text-4xl mt-2 font-bold">20</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">คำขอลาที่ถูกปฏิเสธ</h2>
            <p className="text-4xl mt-2 font-bold">5</p>
          </div>
        </div>

        {/* ปฏิทิน */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              ปฏิทิน {year}
            </h2>
          </div>
          <div className="flex justify-center">
            <Calendar
              tileContent={tileContent}
              tileClassName={tileClassName}
              showNeighboringMonth={false}
              className="w-full max-w-3xl rounded-2xl shadow-lg"
              style={{ fontSize: "1.1rem" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;