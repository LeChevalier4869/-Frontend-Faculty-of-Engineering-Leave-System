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
        setEmploymentTypes(emp.map(e => ({ value: e, label: e })));
      } catch (err) {
        Swal.fire("Error", "โหลดข้อมูล lookup ล้มเหลว", "error");
      }
    };
    fetchLookup();
  }, []);

  // ───────────────────────────────────────────── handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน", "error");
    }
    setLoading(true);
    try {
      const fd = new FormData();
      const keysToExclude = ["confirmPassword", "organizationId"];
      Object.entries(formData).forEach(([k, v]) => {
        fd.append(k, v); 
      });
      if (selectedFile) fd.append("profilePicture", selectedFile);

      const token = localStorage.getItem("token");
      console.log("🚀 Submit formData: ", formData);

      await axios.post(apiEndpoints.createUserByAdmin, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว", "success").then(() =>
        navigate("/admin/manage-user")
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

  // ───────────────────────────────────────────── ui helpers
  const renderDropdown = (label, name, options) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
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
          size={20}
          className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
        />
      </div>
    </div>
  );

  // ───────────────────────────────────────────── render
  return (
    <div className="min-h-screen bg-white text-black px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">เพิ่มผู้ใช้งานใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* prefixName */}
              <div>
                <label className="block text-sm font-medium mb-2">คำนำหน้า</label>
                <input
                  type="text"
                  name="prefixName"
                  value={formData.prefixName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* firstName */}
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อจริง</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* lastName */}
              <div>
                <label className="block text-sm font-medium mb-2">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* sex */}
              {renderDropdown("เพศ", "sex", [
                { value: "MALE", label: "ชาย" },
                { value: "FEMALE", label: "หญิง" },
              ])}
            </div>
          </section>

          {/* Account Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4">ข้อมูลบัญชีผู้ใช้</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* email */}
              <div>
                <label className="block text-sm font-medium mb-2">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* phone */}
              <div>
                <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* password */}
              <div>
                <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* confirm */}
              <div>
                <label className="block text-sm font-medium mb-2">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </section>

          {/* Professional Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4">ข้อมูลการทำงาน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderDropdown("ประเภทบุคลากร", "personnelTypeId", personnelTypes.map((pt) => ({ id: pt.id, name: pt.name })))}
              {renderDropdown("แผนก", "departmentId", departments.map((d) => ({ id: d.id, name: d.name })))}
              {renderDropdown("องค์กร", "organizationId", organizations.map((o) => ({ id: o.id, name: o.name })))}
              {renderDropdown("ประเภทพนักงาน", "employmentType", employmentTypes)}
              {/* hire date */}
              <div>
                <label className="block text-sm font-medium mb-2">วันที่เริ่มงาน</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* profile pic */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">รูปโปรไฟล์ (ถ้ามี)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/manage-user")}
              className="px-5 py-2 bg-white border border-black rounded-lg text-black hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-black rounded-lg text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
