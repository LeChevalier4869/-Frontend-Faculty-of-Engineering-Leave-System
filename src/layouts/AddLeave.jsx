import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../utils/api";

function AddLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      // const token = localStorage.getItem("token");
      // const res = await axios.post(apiEndpoints.leaveRequest, input, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      console.log("Submitted Data:", formData);
      alert("บันทึกข้อมูลสำเร็จ!");
      navigate("/leave");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">ยื่นใบลา</h2>
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
            value={formData.leaveType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">เลือกประเภทการลา</option>
            <option value="sick">ลาป่วย</option>
            <option value="personal">ลากิจ</option>
            <option value="vacation">ลาพักร้อน</option>
            <option value="vacation">ลาคลอด</option>
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
    </div>
  );
}

export default AddLeave;
