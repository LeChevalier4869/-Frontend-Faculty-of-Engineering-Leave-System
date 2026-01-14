import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegAddressCard } from "react-icons/fa";
import { apiEndpoints } from "../../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    prefixName: "",
    firstName: "",
    lastName: "",
    sex: "",
    email: "",
    password: "",
    phone: "",
    hireDate: "",
    personnelTypeId: "",
    organizationId: "",
    departmentId: "",
    position: "",
    images: null,
    employmentType: "",
  });

  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, orgRes, perTypeRes] = await Promise.all([
          axios.get(apiEndpoints.departments),
          axios.get(apiEndpoints.organizations),
          axios.get(apiEndpoints.personnelTypes),
        ]);
        setDepartments(deptRes.data?.data || []);
        setOrganizations(orgRes.data?.data || []);
        setPersonnelTypes(perTypeRes.data?.data || []);
      } catch (err) {
        console.error("❌ Dropdown load failed:", err);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูล dropdown ได้", "error");
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(input).forEach(([key, val]) => formData.append(key, val));
      await axios.post(apiEndpoints.register, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        confirmButtonColor: "#ef4444",
      }).then(() => navigate("/login"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || "ไม่สามารถสมัครสมาชิกได้",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // กลับไปใช้พื้นหลังเดิม (gray-700) และตัวอักษรสีขาว
  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-700 text-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
  const selectClass =
    "appearance-none w-full px-4 py-2 pr-8 rounded-lg border border-gray-300 bg-gray-700 text-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4 font-kanit">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-3xl my-10 border border-gray-700">
        <div className="flex justify-center mb-6">
          <FaRegAddressCard className="text-white text-5xl" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-8">สมัครสมาชิก</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ข้อมูลส่วนตัว */}
          <section>
            <h3 className="text-xl font-semibold text-gray-300 mb-4">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prefix */}
              <div>
                <label className="block text-gray-400 mb-1">คำนำหน้า</label>
                <select
                  name="prefixName"
                  value={input.prefixName}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกคำนำหน้า --</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="นาง">นาง</option>
                </select>
              </div>
              {/* First Name */}
              <div>
                <label className="block text-gray-400 mb-1">ชื่อจริง</label>
                <input
                  type="text"
                  name="firstName"
                  value={input.firstName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-gray-400 mb-1">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={input.lastName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Sex */}
              <div>
                <label className="block text-gray-400 mb-1">เพศ</label>
                <select
                  name="sex"
                  value={input.sex}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกเพศ --</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </section>

          {/* ข้อมูลบัญชี */}
          <section>
            <h3 className="text-xl font-semibold text-gray-300 mb-4">ข้อมูลบัญชีผู้ใช้</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-gray-400 mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={input.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-gray-400 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  name="phone"
                  value={input.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Password */}
              <div>
                <label className="block text-gray-400 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Hire Date */}
              <div>
                <label className="block text-gray-400 mb-1">วันที่เริ่มทำงาน</label>
                <input
                  type="date"
                  name="hireDate"
                  value={input.hireDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* ข้อมูลการทำงาน */}
          <section>
            <h3 className="text-xl font-semibold text-gray-300 mb-4">ข้อมูลการทำงาน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personnel Type */}
              <div>
                <label className="block text-gray-400 mb-1">ประเภทบุคลากร</label>
                <select
                  name="personnelTypeId"
                  value={input.personnelTypeId}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกประเภทบุคลากร --</option>
                  {personnelTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {/* Organization */}
              <div>
                <label className="block text-gray-400 mb-1">องค์กร</label>
                <select
                  name="organizationId"
                  value={input.organizationId}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกองค์กร --</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-gray-400 mb-1">แผนก</label>
                <select
                  name="departmentId"
                  value={input.departmentId}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกแผนก --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {/* Position */}
              <div>
                <label className="block text-gray-400 mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  name="position"
                  value={input.position}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {/* Employment Type */}
              <div>
                <label className="block text-gray-400 mb-1">สายงาน</label>
                <select
                  name="employmentType"
                  value={input.employmentType}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- เลือกสายงาน --</option>
                  <option value="ACADEMIC">สายวิชาการ</option>
                  <option value="SUPPORT">สายสนับสนุน</option>
                </select>
              </div>
            </div>
          </section>

          {/* อัปโหลดรูป */}
          <div>
            <label className="block text-gray-400 mb-1">รูปภาพ</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              onChange={handleChange}
              required
                  className={inputClass}
            />
          </div>

          {/* ปุ่มสมัคร */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            {isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

          {/* กลับไปลงชื่อเข้าใช้ */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-red-400 hover:underline font-medium"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
