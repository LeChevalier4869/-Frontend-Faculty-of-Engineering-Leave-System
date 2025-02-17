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
    isEmergency: "0",
    images: null, // สำหรับใบรับรองแพทย์
    additionalDetails: "", // สำหรับรายละเอียดเพิ่มเติม
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
        alert("กรุณาเข้าสู่ระบบก่อน");
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

      // if (formData.leaveTypeId === "2") {
      //   formDataToSend.append("additionalDetails", formData.additionalDetails);
      // }

      const res = await axios.post(url, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
          <label className="block text-sm font-medium text-gray-700">
            ประเภทการลา
          </label>
          <select
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
          <label className="block text-sm font-medium text-gray-700">
            วันที่เริ่มต้น
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* วันที่สิ้นสุด */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            วันที่สิ้นสุด
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* เหตุผลการลา */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            เหตุผลการลา
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="3"
            required
          />
        </div>

        {/* ถ้าลาป่วย ให้แสดงช่องอัปโหลดใบรับรองแพทย์ */}
        {formData.leaveTypeId === "1" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              แนบไฟล์ใบรับรองแพทย์
            </label>
            <input
              type="file"
              name="images"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              accept=".jpg,.png,.pdf"
            />
          </div>
        )}

        {/* ถ้าลากิจส่วนตัว ให้แสดงช่องกรอกรายละเอียดเพิ่มเติม */}
        {/* {formData.leaveTypeId === "2" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
            />
          </div>
        )} */}

        {/* เร่งด่วนหรือไม่ */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            การลาเร่งด่วน
          </label>
          <select
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
