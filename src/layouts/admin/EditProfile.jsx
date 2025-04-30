// src/layouts/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // inline StyledSelect component
  function StyledSelect({ label, name, value, onChange, options }) {
    return (
      <div className="mb-6">
        <label htmlFor={name} className="block text-base font-semibold text-gray-800 mb-2">
          {label}
        </label>
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="
              block w-full appearance-none
              rounded-lg border border-gray-300
              bg-white px-4 py-3 pr-10
              text-gray-900
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
              transition
            "
          >
            <option value="">{`-- เลือก ${label} --`}</option>
            {options.map((opt) => {
              const val = (opt.value ?? opt.id).toString();
              return (
                <option key={val} value={val}>
                  {opt.label || opt.name}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // build formData from user
  const makeFormFromUser = (u) => ({
    prefixName:      u.prefixName      || "",
    firstName:       u.firstName       || "",
    lastName:        u.lastName        || "",
    email:           u.email           || "",
    phone:           u.phone           || "",
    position:        u.position        || "",
    hireDate:        u.hireDate
      ? new Date(u.hireDate).toISOString().slice(0, 10)
      : "",
    sex:             u.sex             || "",
    personnelTypeId: u.personnelType?.id?.toString() || "",
    departmentId:    u.department?.id?.toString()    || "",
    employmentType:  u.employmentType  || "",
    inActiveRaw:     u.inActive ? "true" : "false",
  });

  const [formData, setFormData] = useState(makeFormFromUser(user));
  const [departments, setDepartments]       = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);

  useEffect(() => {
    setFormData(makeFormFromUser(user));
  }, [user]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [d, p, e] = await Promise.all([
          axios.get(apiEndpoints.lookupDepartments,    { headers }),
          axios.get(apiEndpoints.lookupPersonnelTypes, { headers }),
          axios.get(apiEndpoints.lookupEmploymentTypes,{ headers }),
        ]);
        setDepartments(d.data.data   || []);
        setPersonnelTypes(p.data.data|| []);
        const empList = e.data.data ?? ["ACADEMIC","SUPPORT"];
        setEmploymentTypes(empList.map((v) => ({ value: v, label: v })));
      } catch (err) {
        console.error("Lookup fetch error:", err);
      }
    };
    fetchLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked.toString() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        prefixName:      formData.prefixName,
        firstName:       formData.firstName,
        lastName:        formData.lastName,
        email:           formData.email,
        phone:           formData.phone,
        position:        formData.position,
        hireDate:        formData.hireDate,
        sex:             formData.sex,
        personnelTypeId: Number(formData.personnelTypeId),
        departmentId:    Number(formData.departmentId),
        employmentType:  formData.employmentType,
        inActive:        formData.inActiveRaw === "true",
      };
      await axios.put(apiEndpoints.updateUser(user.id), payload, { headers });

      const { data: meRes } = await axios.get(apiEndpoints.getMe, { headers });
      const freshUser = meRes.data || meRes.user || meRes;
      setUser(freshUser);

      await Swal.fire("อัปเดตสำเร็จ", "โปรไฟล์ถูกอัปเดตแล้ว", "success");
      navigate("/profile");
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire(
        "อัปเดตล้มเหลว",
        err.response?.data?.message || err.message,
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          แก้ไขโปรไฟล์
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StyledSelect
              label="คำนำหน้า"
              name="prefixName"
              value={formData.prefixName}
              onChange={handleChange}
              options={[
                { value: "นาย",    label: "นาย" },
                { value: "นาง",    label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
              ]}
            />

            <div>
              <label htmlFor="firstName" className="block text-base font-semibold text-gray-800 mb-2">
                ชื่อจริง
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-base font-semibold text-gray-800 mb-2">
                นามสกุล
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-2">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-base font-semibold text-gray-800 mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-base font-semibold text-gray-800 mb-2">
                ตำแหน่ง
              </label>
              <input
                id="position"
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label htmlFor="hireDate" className="block text-base font-semibold text-gray-800 mb-2">
                วันที่เริ่มงาน
              </label>
              <input
                id="hireDate"
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <StyledSelect
              label="เพศ"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={[
                { value: "MALE",   label: "ชาย" },
                { value: "FEMALE", label: "หญิง" },
              ]}
            />

            <StyledSelect
              label="ประเภทบุคลากร"
              name="personnelTypeId"
              value={formData.personnelTypeId}
              onChange={handleChange}
              options={personnelTypes}
            />

            <StyledSelect
              label="แผนก"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments}
            />

            <StyledSelect
              label="ประเภทพนักงาน"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={employmentTypes}
            />

            <div className="md:col-span-2 flex items-center">
              <label className="inline-flex items-center space-x-2 text-gray-800">
                <input
                  type="checkbox"
                  name="inActiveRaw"
                  checked={formData.inActiveRaw === "true"}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-200"
                />
                <span className="text-base font-medium">อยู่ในสถานะใช้งาน</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800 font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
