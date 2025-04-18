import React, { useState } from "react";
import { useNavigate }     from "react-router-dom";
import useAuth              from "../../hooks/useAuth";
import Swal                 from "sweetalert2";
import { apiEndpoints }     from "../../utils/api";
import axios                from "axios";


function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    prefixName: user.prefixName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    sex: user.sex || "",
    organizationName: user.organization?.name || "",
    departmentName: user.department?.name || "",
    personnelTypeName: user.personnelType?.name || "",
    employmentType: user.employmentType || "",
    hireDate: user.hireDate ? new Date(user.hireDate).toISOString().substring(0, 10) : "",
    inActive: user.inActive || false,
  });

  const isAdmin = user?.role === "ADMIN" || user?.role?.some((r) => r.name === "ADMIN");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { /* error */ }
  
    // สร้าง payload ตาม role
    const base = {
      prefixName: formData.prefixName,
      firstName:  formData.firstName,
      lastName:   formData.lastName,
      sex:        formData.sex,
      email:      formData.email,
      phone:      formData.phone,
    };
    const payload = isAdmin
      ? {
          ...base,
          hireDate:        formData.hireDate,
          inActive:        formData.inActive,
          employmentType:  formData.employmentType,
          personnelTypeId: parseInt(formData.personnelTypeId),
          departmentId:    parseInt(formData.departmentId),
          organizationId:  parseInt(formData.organizationId),
        }
      : base;
  
    try {
      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      /* success toast… */
    } catch(err) {
      /* error toast… */
    }
  };  

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          แก้ไขโปรไฟล์
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ฟิลด์ทั่วไป */}
            {[
              ["คำนำหน้า", "prefixName"],
              ["ชื่อ", "firstName"],
              ["นามสกุล", "lastName"],
              ["อีเมล", "email"],
              ["เบอร์โทรศัพท์", "phone"],
              ["เพศ", "sex"],
              ["คณะ", "organizationName"],
              ["สาขา", "departmentName"],
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}

            {/* ประเภทบุคลากร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทบุคลากร</label>
              {isAdmin ? (
                <input
                  type="text"
                  name="personnelTypeName"
                  value={formData.personnelTypeName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <input
                  type="text"
                  value={formData.personnelTypeName}
                  disabled
                  className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทบุคลากร</label>
              {isAdmin ? (
                <input
                  type="text"
                  name="personnelTypeName"
                  value={formData.personnelTypeName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <input
                  type="text"
                  value={formData.personnelTypeName}
                  disabled
                  className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สายงาน</label>
              {isAdmin ? (
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- เลือกสายงาน --</option>
                  <option value="ACADEMIC">สายวิชาการ</option>
                  <option value="SUPPORT">สายสนับสนุน</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={
                    formData.employmentType === "ACADEMIC"
                      ? "สายวิชาการ"
                      : formData.employmentType === "SUPPORT"
                        ? "สายสนับสนุน"
                        : "ไม่ระบุ"
                  }
                  disabled
                  className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>

            {/* วันที่เริ่มงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มงาน</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* สถานะการใช้งาน */}
            <div className="md:col-span-2">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="inActive"
                  checked={formData.inActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  อยู่ในสถานะใช้งาน
                </span>
              </label>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
