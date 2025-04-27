import React, { useState } from "react";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import Swal from "sweetalert2";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";

function LeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    isEmergency: "0",
    images: null,
  });

  const inputStyle =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อน",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("leaveTypeId", formData.leaveTypeId);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("reason", formData.reason);
      formDataToSend.append("isEmergency", formData.isEmergency === "1");

      if (formData.leaveTypeId === "1" && formData.images) {
        formDataToSend.append("images", formData.images);
      }

      await axios.post(getApiUrl("leave-requests/"), formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "บันทึกคำขอลาสำเร็จ",
        text: "ระบบได้บันทึกข้อมูลของคุณแล้ว",
        confirmButtonColor: "#3b82f6",
      });
      onSuccess();
    } catch (err) {
      console.error("❌ Submit Error:", err.response || err.message || err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative font-kanit text-black">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">ยื่นคำร้องการลา</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ประเภทการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">ประเภทการลา</label>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              required
              className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">เลือกประเภทการลา</option>
              <option value="1">ลาป่วย</option>
              <option value="2">ลากิจส่วนตัว</option>
              <option value="3">ลาพักผ่อน</option>
            </select>
          </div>

          {/* วันที่เริ่มต้น */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          {/* เหตุผลการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">เหตุผลการลา</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              required
              className={inputStyle}
            />
          </div>

          {/* แนบไฟล์ (เฉพาะลาป่วย) */}
          {formData.leaveTypeId === "1" && (
            <div>
              <label className="block text-sm font-medium mb-1">แนบไฟล์ใบรับรองแพทย์</label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className={inputStyle}
              />
            </div>
          )}

          {/* ปุ่ม */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-black hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestModal;
