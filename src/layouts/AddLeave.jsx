import React from "react";
import { Link } from "react-router-dom";

function AddLeave() {
  return (
    <div className="bg-gray-100 flex flex-col justify-center items-center px-4 py-8 min-h-screen">
      <h2 className="text-4xl font-semibold text-center text-blue-600 mb-8">
        เลือกประเภทการลา
      </h2>
      <div className="space-y-4 mb-6">
        <Link
          to="/leave/sick"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded m-4 w-48 h-14 shadow-md hover:shadow-lg transition duration-200"
        >
          ลาป่วย
        </Link>
        <Link
          to="/leave/personal"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded m-4 w-48 h-14 shadow-md hover:shadow-lg transition duration-200"
        >
          ลากิจ
        </Link>
        <Link
          to="/leave/giving-birth"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded m-4 w-48 h-14 shadow-md hover:shadow-lg transition duration-200"
        >
          ลาคลอด
        </Link>
        <Link
          to="/leave/vacation"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded m-4 w-48 h-14 shadow-md hover:shadow-lg transition duration-200"
        >
          ลาพักผ่อน
        </Link>
      </div>
      <p className="text-lg text-center text-gray-700">
        หมายเหตุ: หากท่านต้องการลานอกเหนือจากนี้ ให้ดำเนินการผ่านเอกสารแบบปกติ เนื่องจากจำเป็นต้องใช้ลายเซ็นตัวจริง ขออภัยในความไม่สะดวก
      </p>
    </div>
  );
}

export default AddLeave;
