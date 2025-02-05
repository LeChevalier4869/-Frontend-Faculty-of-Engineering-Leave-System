import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../utils/api";
import getApiUrl from "../utils/apiUtils";
import axios from "axios";

function AddLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    isEmergency: "0", // ค่าเริ่มต้นเป็น "0" (ไม่เร่งด่วน)
  });

  const endpoint = "leave-requests/";
  const url = getApiUrl(endpoint);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        return;
      }
      const res = await axios.post(
        url,
        {
          leaveTypeId: formData.leaveTypeId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          isEmergency: formData.isEmergency === "1", // แปลงค่าจาก string เป็น boolean
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Submitted Data:", res.data);
      alert("บันทึกข้อมูลสำเร็จ!");
      navigate("/leave");
    } catch (err) {
      console.error(err.message);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">แบบฟอร์มคำร้องขอการลา</h2>

      <form onSubmit={handleSubmit}>
        {/* ประเภทการลา */}
        <div className="mb-4">
          <label
            htmlFor="leaveTypeId"
            className="block text-sm font-medium text-gray-700"
          >
            ประเภทการลา
          </label>
          <select
            id="leaveTypeId"
            name="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">เลือกประเภทการลา</option>
            <option value="1">ลาป่วย</option>
            <option value="2">ลากิจส่วนตัว</option>
            <option value="3">ลาพักผ่อน</option>
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

        {/* เร่งด่วนหรือไม่ */}
        <div className="mb-4">
          <label
            htmlFor="isEmergency"
            className="block text-sm font-medium text-gray-700"
          >
            การลาเร่งด่วน
          </label>
          <select
            id="isEmergency"
            name="isEmergency"
            value={formData.isEmergency}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="0">ไม่เร่งด่วน</option>
            <option value="1">เร่งด่วน</option>
          </select>
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
    </div>
  );
}

export default AddLeave;
