import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import Swal from "sweetalert2";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { apiEndpoints } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { filterLeaveTypesBySex } from "../../utils/leavePolicy";

function AddLeave2() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(apiEndpoints.availableLeaveType);
        // ทดสอบ response
        // console.log("Leave Types:", response.data.data);
        setLeaveTypes(filterLeaveTypesBySex(response.data.data, user?.sex));
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    }

    fetchData();
  }, [user?.sex]);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    contact: "",
    isEmergency: "0",
    images: null,
    additionalDetails: "",
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

    const token = localStorage.getItem("accessToken");
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
      formDataToSend.append("contact", formData.contact);
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
        confirmButtonText: "ตกลง",
      }).then(() => navigate("/leave"));
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

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          แบบฟอร์มคำร้องขอการลา
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ประเภทการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ประเภทการลา
            </label>
            <div className="relative">
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">เลือกประเภทการลา</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>

          {/* วันที่เริ่มต้น */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-1"
            >
              วันที่เริ่มต้น
            </label>
            <div className="relative w-full">
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-12 cursor-pointer`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              วันที่สิ้นสุด
            </label>
            <div className="relative w-full">
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-12 cursor-pointer`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          {/* เหตุผลการลา */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              เหตุผลการลา
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              // required ไม่บังคับให้กรอก
              className={inputStyle}
            />
          </div>

          {/* ช่องทางติดต่อ */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium mb-1">
              ช่องทางติดต่อ
            </label>
            <textarea
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              rows="2"
              className={inputStyle}
            />
          </div>

          {/* แนบไฟล์ */}
          {formData.leaveTypeId === "1" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                แนบไฟล์ใบรับรองแพทย์
              </label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className={inputStyle}
              />
            </div>
          )}

          {/* การลาเร่งด่วน 
          {/*
          <div>
            <label className="block text-sm font-medium mb-1">การลาเร่งด่วน</label>
            <div className="relative">
              <select
                name="isEmergency"
                value={formData.isEmergency}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
              >
                <option value="0">ไม่เร่งด่วน</option>
                <option value="1">เร่งด่วน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>
          */}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/leave")}
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

export default AddLeave2;
