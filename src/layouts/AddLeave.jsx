import React from "react";
import { Link } from "react-router-dom";

function AddLeave() {
  return (
<<<<<<< HEAD
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
=======
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">แบบฟอร์มคำร้องขอการลา</h2>
      <form onSubmit={handleSubmit}>
        {/* ประเภทการลา */}
        <div className="mb-4">
          <label
            htmlFor="leaveType"
            className="block text-sm font-medium text-gray-700"
          >
            ประเภทการลา
          </label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveTypeId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">เลือกประเภทการลา</option>
            <option value="sick">ลาป่วย</option>
            <option value="personal">ลากิจ</option>
            <option value="vacation">ลาพักผ่อน</option>
            <option value="vacation">ลาคลอดบุตร</option>
          </select>
        </div>

        {/* วันที่เริ่มต้น */}
        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            วันที่เริ่มต้น
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* วันที่สิ้นสุด */}
        <div className="mb-4">
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            วันที่สิ้นสุด
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* เหตุผลการลา */}
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700"
          >
            เหตุผลการลา
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="3"
            required
          />
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/leave")}
            className="btn mr-2 bg-gray-300 hover:bg-gray-400 text-black"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="btn bg-blue-500 hover:bg-blue-600 text-white"
          >
            บันทึก
          </button>
        </div>
      </form>
>>>>>>> bc7a0e602ffa55040202dd2e3de2eadbf538b446
    </div>
  );
}

export default AddLeave;
