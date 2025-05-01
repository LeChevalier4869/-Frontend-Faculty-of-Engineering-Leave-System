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

  /* ---------- StyledSelect (unchanged) ---------- */
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
            className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">{`-- เลือก ${label} --`}</option>
            {options.map((opt) => (
              <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
                {opt.label ?? opt.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- build formData from user ---------- */
  const makeFormFromUser = (u) => ({
    prefixName:      u?.prefixName      || "",
    firstName:       u?.firstName       || "",
    lastName:        u?.lastName        || "",
    email:           u?.email           || "",
    phone:           u?.phone           || "",
    /* 👇  รองรับได้ทั้ง  string  และ object { id, name } */
    position:        typeof u?.position === "object"
                      ? u.position?.name ?? ""
                      : u?.position      ?? "",
    hireDate:        u?.hireDate ? new Date(u.hireDate).toISOString().slice(0, 10) : "",
    sex:             u?.sex             || "",
    personnelTypeId: u?.personnelType?.id?.toString() || "",
    departmentId:    u?.department?.id?.toString()    || "",
    employmentType:  u?.employmentType  || "",
    inActiveRaw:     u?.inActive ? "true" : "false",
  });

  /* ---------- state ---------- */
  const [formData, setFormData]           = useState(makeFormFromUser(user));
  const [departments,     setDepartments] = useState([]);
  const [personnelTypes,  setPersonnelTypes]  = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [positions,       setPositions]   = useState([]);

  /* ---------- sync user → form ---------- */
  useEffect(() => setFormData(makeFormFromUser(user)), [user]);

  /* ---------- fetch look-ups ---------- */
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [d, p, e, pos] = await Promise.all([
          axios.get(apiEndpoints.lookupDepartments,     { headers }),
          axios.get(apiEndpoints.lookupPersonnelTypes,  { headers }),
          axios.get(apiEndpoints.lookupEmploymentTypes, { headers }),
          axios.get(apiEndpoints.lookupPositions,       { headers }),
        ]);

        setDepartments(d.data.data || []);
        setPersonnelTypes(p.data.data || []);

        const empTh = { ACADEMIC: "สายวิชาการ", SUPPORT: "สายสนับสนุน", OTHER: "อื่น ๆ" };
        const empList = e.data.data ?? ["ACADEMIC", "SUPPORT"];
        setEmploymentTypes(empList.map((v) => ({ value: v, label: empTh[v] ?? v })));

        /* เก็บเฉพาะชื่อ ตัด null/undefined ออก */
        setPositions((pos.data.data || []).map((x) => x.name).filter(Boolean));
      } catch (err) {
        console.error("Lookup fetch error:", err);
      }
    };
    fetchLookups();
  }, []);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    /* เก็บ checkbox เป็น string (“true” / “false”) เพื่อความง่ายตอน payload */
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked.toString() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token   = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        prefixName:      formData.prefixName,
        firstName:       formData.firstName,
        lastName:        formData.lastName,
        email:           formData.email,
        phone:           formData.phone,
        position:        formData.position,        // ← ส่งชื่อ string ตรง ๆ
        hireDate:        formData.hireDate,
        sex:             formData.sex,
        personnelTypeId: Number(formData.personnelTypeId),
        departmentId:    Number(formData.departmentId),
        employmentType:  formData.employmentType,
        inActive:        formData.inActiveRaw === "true",
      };

      await axios.put(apiEndpoints.updateUser(user.id), payload, { headers });

      /* refresh authed user */
      const { data: meRes } = await axios.get(apiEndpoints.getMe, { headers });
      setUser(meRes.data || meRes.user || meRes);

      await Swal.fire("อัปเดตสำเร็จ", "โปรไฟล์ถูกอัปเดตแล้ว", "success");
      navigate("/profile");
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("อัปเดตล้มเหลว", err.response?.data?.message || err.message, "error");
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-6 shadow-lg sm:p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-black">แก้ไขโปรไฟล์</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* คำนำหน้า */}
            <StyledSelect
              label="คำนำหน้า"
              name="prefixName"
              value={formData.prefixName}
              onChange={handleChange}
              options={[
                { value: "นาย", label: "นาย" },
                { value: "นาง", label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
              ]}
            />

            {/* firstName */}
            <div>
              <label htmlFor="firstName" className="mb-2 block text-base font-semibold text-gray-800">ชื่อจริง</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* lastName */}
            <div>
              <label htmlFor="lastName" className="mb-2 block text-base font-semibold text-gray-800">นามสกุล</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-base font-semibold text-gray-800">อีเมล</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* phone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-base font-semibold text-gray-800">เบอร์โทรศัพท์</label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* position – text + datalist suggestion */}
            <div>
              <label htmlFor="position" className="mb-2 block text-base font-semibold text-gray-800">ตำแหน่ง</label>
              <input
                id="position"
                name="position"
                type="text"
                list="positionsDL"
                value={formData.position}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <datalist id="positionsDL">
                {positions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            {/* hireDate */}
            <div>
              <label htmlFor="hireDate" className="mb-2 block text-base font-semibold text-gray-800">วันที่เริ่มงาน</label>
              <input
                id="hireDate"
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* sex */}
            <StyledSelect
              label="เพศ"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={[
                { value: "MALE", label: "ชาย" },
                { value: "FEMALE", label: "หญิง" },
              ]}
            />

            {/* personnelType */}
            <StyledSelect
              label="ประเภทบุคลากร"
              name="personnelTypeId"
              value={formData.personnelTypeId}
              onChange={handleChange}
              options={personnelTypes}
            />

            {/* department */}
            <StyledSelect
              label="แผนก"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments}
            />

            {/* employmentType */}
            <StyledSelect
              label="ประเภทพนักงาน"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={employmentTypes}
            />

            {/* inActive */}
            <div className="md:col-span-2 flex items-center">
              <label className="inline-flex items-center space-x-2 text-gray-800">
                <input
                  type="checkbox"
                  name="inActiveRaw"
                  checked={formData.inActiveRaw === "true"}
                  onChange={handleChange}
                  className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-200"
                />
                <span className="text-base font-medium">อยู่ในสถานะใช้งาน</span>
              </label>
            </div>
          </div>

          {/* action buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-lg bg-gray-300 px-6 py-3 font-medium text-gray-800 transition hover:bg-gray-400"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
