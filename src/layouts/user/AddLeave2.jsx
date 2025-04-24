import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ เพิ่ม SweetAlert2

function AddLeave2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    isEmergency: "0",
    images: null,
    additionalDetails: "",
  });

  const endpoint = "leave-requests/";
  const url = getApiUrl(endpoint);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาเข้าสู่ระบบก่อน",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("leaveTypeId", formData.leaveTypeId);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("reason", formData.reason);
      formDataToSend.append("isEmergency", formData.isEmergency === "1");

      if (formData.leaveTypeId === "1" && formData.images) {
        formDataToSend.append("images", formData.images);
      }

      await axios.post(url, formDataToSend, {
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
        confirmButtonText: "ตกลง",
      }).then(() => navigate("/leave"));
    } catch (err) {
      console.error("❌ Submit Error:", err.response || err.message || err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ลองอีกครั้ง",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">แบบฟอร์มคำร้องขอการลา</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ประเภทการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">ประเภทการลา</label>
            <div className="relative">
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleChange}
                required
                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">เลือกประเภทการลา</option>
                <option value="1">ลาป่วย</option>
                <option value="2">ลากิจส่วนตัว</option>
                <option value="3">ลาพักผ่อน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* วันที่เริ่มต้น */}
          <div>
            <label className="block text-sm font-medium mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-black rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <label className="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full border border-black rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* แนบไฟล์ */}
          {formData.leaveTypeId === "1" && (
            <div>
              <label className="block text-sm font-medium mb-1">แนบไฟล์ใบรับรองแพทย์</label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                accept=".jpg,.png,.pdf"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {/* การลาเร่งด่วน */}
          {/*}
          <div>
            <label className="block text-sm font-medium mb-1">การลาเร่งด่วน</label>
            <div className="relative">
              <select
                name="isEmergency"
                value={formData.isEmergency}
                onChange={handleChange}
                required
                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="0">ไม่เร่งด่วน</option>
                <option value="1">เร่งด่วน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {*/}

          {/* ปุ่ม */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/leave")}
              className="px-6 py-2 rounded-lg bg-gray-200 text-black hover:bg-gray-300 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLeave2;
