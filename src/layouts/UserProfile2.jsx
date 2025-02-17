import React from "react";
import useAuth from "../hooks/useAuth";
import { FaUserAlt } from "react-icons/fa"; // นำเข้าไอคอนจาก react-icons

function UserProfile2() {
  const { user } = useAuth();
  console.log(user);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">โปรไฟล์ผู้ใช้</h1>

      <div className="bg-white shadow rounded-lg p-6">
        {/* รูปโปรไฟล์ ขยายขนาด หรือแสดงไอคอนถ้าไม่มีรูป */}
        <div className="flex justify-center mb-6">
          {user.profilePicturePath ? (
            <img
              src={user.profilePicturePath}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-gray-300 shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 rounded-full flex justify-center items-center bg-gray-200 border-4 border-gray-300 shadow-lg">
              <FaUserAlt className="text-gray-600 w-16 h-16" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ชื่อ-นามสกุล */}
          <div>
            <label className="block text-sm font-bold mb-2">ชื่อ-นามสกุล</label>
            <p className="bg-gray-100 p-3 rounded">
              {user.prefixName}
              {user.firstName} {user.lastName}
            </p>
          </div>

          {/* อีเมล */}
          <div>
            <label className="block text-sm font-bold mb-2">อีเมล</label>
            <p className="bg-gray-100 p-3 rounded">{user.email}</p>
          </div>

          {/* เพศ */}
          <div>
            <label className="block text-sm font-bold mb-2">เพศ</label>
            <p className="bg-gray-100 p-3 rounded">{user.sex}</p>
          </div>

          {/* เบอร์มือถือ */}
          <div>
            <label className="block text-sm font-bold mb-2">เบอร์มือถือ</label>
            <p className="bg-gray-100 p-3 rounded">{user.phone}</p>
          </div>

          {/* คณะ */}
          <div>
            <label className="block text-sm font-bold mb-2">คณะ</label>
            <p className="bg-gray-100 p-3 rounded">{user.organization?.name}</p>
          </div>

          {/* สาขา */}
          <div>
            <label className="block text-sm font-bold mb-2">สาขา</label>
            <p className="bg-gray-100 p-3 rounded">{user.department?.name}</p>
          </div>

          {/* ประเภทบุคลากร */}
          <div>
            <label className="block text-sm font-bold mb-2">
              ประเภทบุคลากร
            </label>
            <p className="bg-gray-100 p-3 rounded">
              {user.personnelType?.name}
            </p>
          </div>

          {/* สายงาน */}
          <div>
            <label className="block text-sm font-bold mb-2">สายงาน</label>
            <p className="bg-gray-100 p-3 rounded">
              {user.employmentType === "SUPPORT"
                ? "สายสนับสนุน"
                : user.employmentType === "ACADEMIC"
                ? "สายวิชาการ"
                : "ไม่มีข้อมูล"}
            </p>
          </div>

          {/* ปีที่เริ่มงาน */}
          <div>
            <label className="block text-sm font-bold mb-2">
              ปีที่เริ่มงาน
            </label>
            <p className="bg-gray-100 p-3 rounded">
              {new Date(user.hireDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* สถานะการใช้งาน */}
          <div>
            <label className="block text-sm font-bold mb-2">
              สถานะการใช้งาน
            </label>
            <p className="bg-gray-100 p-3 rounded">
              {user.inActive ? "อยู่" : "ไม่อยู่"}
            </p>
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
