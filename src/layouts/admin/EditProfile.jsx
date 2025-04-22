import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin =
    Array.isArray(user?.userRoles) && user.userRoles.some(ur => ur.role?.name === "ADMIN") ||
    user?.role === "ADMIN" ||
    Array.isArray(user?.roleNames) && user.roleNames.includes("ADMIN");

  const [departments, setDepartments] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);

  const initialForm = {
    prefixName: user.prefixName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    position: user.position || "",
    hireDate: user.hireDate ? new Date(user.hireDate).toISOString().slice(0, 10) : "",
    sex: user.sex || "",
    personnelTypeId: user.personnelType?.id || "",
    departmentId: user.department?.id || "",
    employmentType: user.employmentType || "",
    inActiveRaw: user.inActive ? "true" : "false",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token = localStorage.getItem("token");
        const [deptRes, ptRes, empRes] = await Promise.all([
          axios.get(apiEndpoints.lookupDepartments,    { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(apiEndpoints.lookupPersonnelTypes, { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(apiEndpoints.lookupEmploymentTypes,{ headers:{ Authorization:`Bearer ${token}` } }),
        ]);
        setDepartments(deptRes.data.data);
        setPersonnelTypes(ptRes.data.data);
        const emp = empRes.data.data ?? ["ACADEMIC","SUPPORT"];
        setEmploymentTypes(emp.map(e => ({ value:e, label:e })));
      } catch(err) {
        console.error(err);
      }
    };
    fetchLookups();
  }, []);  

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked.toString() : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        prefixName: formData.prefixName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        hireDate: new Date(formData.hireDate),
        sex: formData.sex,
        ...(isAdmin && {
          personnelTypeId: Number(formData.personnelTypeId),
          departmentId: Number(formData.departmentId),
          employmentType: formData.employmentType,
          inActive: formData.inActiveRaw === "true",
        })
      };
      const endpoint = isAdmin
        ? apiEndpoints.updateUserByIdAdmin(user.id)
        : `${apiEndpoints.updateUser}/${user.id}`;

      await axios.put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("อัปเดตสำเร็จ", "โปรไฟล์ของคุณได้รับการอัปเดตแล้ว", "success")
        .then(() => navigate(isAdmin ? "/admin/manage-user" : "/profile"));
    } catch (err) {
      console.error(err);
      Swal.fire("อัปเดตล้มเหลว", err.response?.data?.message || err.message, "error");
    }
  };

  const renderDropdown = (label, name, options) => (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-black mb-1">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48 overflow-y-auto"
        >
          <option value="">-- เลือก{label} --</option>
          {options.map(opt => (
            <option
              key={opt.value || opt.id}
              value={opt.value || opt.id}
              className="bg-white text-black hover:bg-gray-100"
            >
              {opt.label || opt.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">แก้ไขโปรไฟล์</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["คำนำหน้า", "prefixName"],
              ["ชื่อจริง", "firstName"],
              ["นามสกุล", "lastName"],
              ["อีเมล", "email"],
              ["เบอร์โทรศัพท์", "phone"],
              ["ตำแหน่ง", "position"]
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1 text-black">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={label}
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1 text-black">วันที่เริ่มงาน</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {renderDropdown("เพศ", "sex", [
              { value: "MALE", label: "ชาย" },
              { value: "FEMALE", label: "หญิง" }
            ])}

            {renderDropdown("ประเภทบุคลากร", "personnelTypeId", personnelTypes)}
            {renderDropdown("แผนก", "departmentId", departments)}
            {renderDropdown("ประเภทพนักงาน", "employmentType", employmentTypes)}

            <div className="md:col-span-2 flex items-center">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="inActiveRaw"
                  checked={formData.inActiveRaw === "true"}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    inActiveRaw: e.target.checked ? "true" : "false"
                  }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-black">อยู่ในสถานะใช้งาน</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(isAdmin ? "/admin/manage-user" : "/profile")}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-black"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}