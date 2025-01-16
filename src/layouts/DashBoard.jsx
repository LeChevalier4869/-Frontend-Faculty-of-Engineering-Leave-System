import { Link } from "react-router-dom";
import React from "react";

function DashBoard() {
  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">แดชบอร์ด</h2>

      {/* สถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-6">
        <div className="bg-blue-500 text-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">จำนวนคำขอลา</h2>
          <p className="text-3xl mt-2">25</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">คำขอลาที่อนุมัติ</h2>
          <p className="text-3xl mt-2">20</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">คำขอลาที่ถูกปฏิเสธ</h2>
          <p className="text-3xl mt-2">5</p>
        </div>
      </div>

      {/* การนำทาง */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/leave"
          className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-bold mb-2">จัดการคำขอลา</h2>
          <p>ดูและจัดการคำขอลาทั้งหมด</p>
        </Link>
        <Link
          to="/leave/add"
          className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-bold mb-2">เพิ่มคำขอลา</h2>
          <p>ยื่นคำขอลาใหม่</p>
        </Link>
        <Link
          to="/profile"
          className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-bold mb-2">โปรไฟล์ผู้ใช้</h2>
          <p>ดูและแก้ไขข้อมูลผู้ใช้</p>
        </Link>
      </div>
      {/* <Link
        to="/export-pdf"
        className="block bg-gray-100 p-6 rounded shadow hover:bg-gray-200 transition mt-6"
      >
        <h2 className="text-xl font-bold mb-2">สร้าง PDF</h2>
        <p>ดาวน์โหลดข้อมูลของคุณในรูปแบบ PDF</p>
      </Link> */}
    </div>
  );
}

export default DashBoard;
