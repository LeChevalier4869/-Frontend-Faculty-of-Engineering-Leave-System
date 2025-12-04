import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

const initialForm = {
  prefixName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  sex: "",
  password: "",
  confirmPassword: "",
  personnelTypeId: "",
  organizationId: "",
  departmentId: "",
  employmentType: "",
  hireDate: "",
  inActiveRaw: "false",
};

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]); // fallback static จะกำหนดหลัง fetch
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLookup = async () => {
      try {
        const [deptRes, orgRes, ptRes, empRes] = await Promise.all([
          axios.get(apiEndpoints.lookupDepartments),
          axios.get(apiEndpoints.lookupOrganizations),
          axios.get(apiEndpoints.lookupPersonnelTypes),
          axios
            .get(apiEndpoints.lookupEmploymentTypes)
            .catch(() => ({ data: { data: ["ACADEMIC", "SUPPORT"] } })),
        ]);

        setDepartments(deptRes.data.data);
        setOrganizations(orgRes.data.data);
        setPersonnelTypes(ptRes.data.data);
        const emp = empRes.data.data ?? ["ACADEMIC", "SUPPORT"];
        setEmploymentTypes(emp.map((e) => ({ value: e, label: e })));
      } catch (err) {
        Swal.fire("Error", "โหลดข้อมูล lookup ล้มเหลว", "error");
      }
    };
    fetchLookup();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const renderDropdown = (label, name, options) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-slate-800">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="appearance-none w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="" disabled>
            -- เลือก{label} --
          </option>
          {options.map((opt) => (
            <option key={opt.value || opt.id} value={opt.value || opt.id}>
              {opt.label || opt.name}
            </option>
          ))}
        </select>
        <HiOutlineChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน", "error");
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        fd.append(k, v);
      });
      if (selectedFile) fd.append("profilePicture", selectedFile);

      const token = localStorage.getItem("accessToken");
      await axios.post(apiEndpoints.createUserByAdmin, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว", "success").then(
        () => navigate("/admin/manage-user")
      );
    } catch (err) {
      Swal.fire(
        "ผิดพลาด",
        err.response?.data?.message || "ไม่สามารถเพิ่มผู้ใช้งานได้",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8 font-kanit rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              เพิ่มผู้ใช้งานใหม่
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              กรอกข้อมูลส่วนตัว ข้อมูลการทำงาน และสร้างบัญชีผู้ใช้ให้บุคลากรใหม่
            </p>
          </div>
        </div>

        <Panel className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                ข้อมูลส่วนตัว
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderDropdown("คำนำหน้า", "prefixName", [
                  { value: "นาย", label: "นาย" },
                  { value: "นางสาว", label: "นางสาว" },
                  { value: "นาง", label: "นาง" },
                ])}
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    ชื่อจริง
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="กรอกชื่อจริง"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="กรอกนามสกุล"
                  />
                </div>
                {renderDropdown("เพศ", "sex", [
                  { value: "MALE", label: "ชาย" },
                  { value: "FEMALE", label: "หญิง" },
                ])}
              </div>
            </section>

            {/* Account Info */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                ข้อมูลบัญชีผู้ใช้
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="example@kku.ac.th"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="เช่น 081-234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="กำหนดรหัสผ่าน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    ยืนยันรหัสผ่าน
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  />
                </div>
              </div>
            </section>

            {/* Professional Info */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                ข้อมูลการทำงาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderDropdown(
                  "ประเภทบุคลากร",
                  "personnelTypeId",
                  personnelTypes.map((pt) => ({ value: pt.id, label: pt.name }))
                )}
                {renderDropdown(
                  "แผนก",
                  "departmentId",
                  departments.map((d) => ({ value: d.id, label: d.name }))
                )}
                {renderDropdown(
                  "องค์กร",
                  "organizationId",
                  organizations.map((o) => ({ value: o.id, label: o.name }))
                )}
                {renderDropdown(
                  "ประเภทพนักงาน",
                  "employmentType",
                  employmentTypes
                )}
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    วันที่เริ่มงาน
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    รูปโปรไฟล์ (ถ้ามี)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-sm text-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/manage-user")}
                className="px-5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition ${
                  loading
                    ? "bg-sky-300 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-500"
                }`}
              >
                {loading ? "กำลังบันทึก..." : "บันทึกผู้ใช้งาน"}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
