import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import getApiUrl from "../../utils/apiUtils";

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prefixName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sex: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน", "error");
    }
    setLoading(true);
    try {
      const url = getApiUrl(apiEndpoints.register);
      await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" }
      });
      Swal.fire("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว", "success").then(() => {
        navigate("/admin/manage-user");
      });
    } catch (err) {
      console.error(err);
      Swal.fire("ผิดพลาด", err.response?.data?.message || "ไม่สามารถเพิ่มผู้ใช้งานได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          เพิ่มผู้ใช้งานใหม่
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["คำนำหน้า", "prefixName", "text"],
              ["ชื่อจริง", "firstName", "text"],
              ["นามสกุล", "lastName", "text"],
              ["อีเมล", "email", "email"],
              ["เบอร์โทรศัพท์", "phone", "text"]
            ].map(([label, name, type]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-black mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}

            {/* Customized Sex Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                เพศ
              </label>
              <div className="relative">
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>
                    -- เลือกเพศ --
                  </option>
                  <option value="MALE">ชาย</option>
                  <option value="FEMALE">หญิง</option>
                </select>
                <HiOutlineChevronDown
                  size={20}
                  className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/manage-user")}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-black"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
