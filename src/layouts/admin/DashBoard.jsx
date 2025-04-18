import { Link } from "react-router-dom";
import React from "react";
import { FaChartPie } from "react-icons/fa";

function DashBoard() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-10">
          <FaChartPie className="text-gray-800 text-4xl mr-3" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
            แดชบอร์ด
          </h1>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-50 border border-gray-200 text-gray-800 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">จำนวนคำขอลา</h2>
            <p className="text-4xl mt-2 font-bold">25</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-gray-800 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">คำขอลาที่อนุมัติ</h2>
            <p className="text-4xl mt-2 font-bold">20</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-gray-800 p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold">คำขอลาที่ถูกปฏิเสธ</h2>
            <p className="text-4xl mt-2 font-bold">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
