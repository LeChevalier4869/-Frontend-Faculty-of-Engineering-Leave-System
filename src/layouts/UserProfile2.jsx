import React, { useState } from "react";
import useAuth from "../hooks/useAuth";

function UserProfile2() {
  // ข้อมูลผู้ใช้
  // const [user, setUser] = useState({
  //   name: "สมชาย ใจดี",
  //   email: "somchai@example.com",
  //   phone: "081-234-5678",
  //   department: "ฝ่ายทรัพยากรบุคคล",
  //   position: "เจ้าหน้าที่ฝ่ายบุคคล",
  //   startDate: "2022-01-15",
  // });

  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">โปรไฟล์ผู้ใช้</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">ชื่อ-นามสกุล</label>
            <p className="bg-gray-100 p-3 rounded">
              {user.prefixName} {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">อีเมล</label>
            <p className="bg-gray-100 p-3 rounded">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">
              เบอร์โทรศัพท์
            </label>
            <p className="bg-gray-100 p-3 rounded">-</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">แผนก</label>
            <p className="bg-gray-100 p-3 rounded">{user.department}</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">ตำแหน่ง</label>
            <p className="bg-gray-100 p-3 rounded">{user.position}</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">ประเภทของบุคลากร</label>
            <p className="bg-gray-100 p-3 rounded">{user.personnelType}</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">
              ปีที่เริ่มงาน
            </label>
            <p className="bg-gray-100 p-3 rounded">{user.hireYear}</p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            แก้ไขโปรไฟล์
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile2;
