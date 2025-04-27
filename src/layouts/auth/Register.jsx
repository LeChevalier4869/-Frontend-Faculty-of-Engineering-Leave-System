import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import { FaRegAddressCard } from "react-icons/fa";
import Swal from "sweetalert2";

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
    images: "",
    employmentType: "",
  });

  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
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
        console.error("❌ ดึงข้อมูล dropdown ล้มเหลว:", err);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูล dropdown ได้", "error");
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setInput((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      for (let key in input) {
        formData.append(key, input[key]);
      }

      await axios.post(apiEndpoints.register, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        navigate("/login");
      });
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-white to-rose-200 px-4 font-kanit">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-3xl my-10">
        <div className="flex justify-center mb-6">
          <FaRegAddressCard className="text-red-500 text-5xl" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">สมัครสมาชิก</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- ข้อมูลส่วนตัว --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* คำนำหน้า */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">คำนำหน้า</label>
                <select
                  name="prefixName"
                  value={input.prefixName}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- เลือกคำนำหน้า --</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="นาง">นาง</option>
                </select>
              </div>

              {/* ชื่อจริง */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">ชื่อจริง</label>
                <input
                  type="text"
                  name="firstName"
                  value={input.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* นามสกุล */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={input.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* เพศ */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">เพศ</label>
                <select
                  name="sex"
                  value={input.sex}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- เลือกเพศ --</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </section>

          {/* --- ข้อมูลบัญชีผู้ใช้ --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลบัญชีผู้ใช้</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={input.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  name="phone"
                  value={input.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">วันที่เริ่มทำงาน</label>
                <input
                  type="date"
                  name="hireDate"
                  value={input.hireDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </section>

          {/* --- ข้อมูลการทำงาน --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลการทำงาน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* personnelTypeId */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">ประเภทบุคลากร</label>
                <select
                  name="personnelTypeId"
                  value={input.personnelTypeId}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- เลือกประเภทบุคลากร --</option>
                  {personnelTypes.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* organizationId */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">องค์กร</label>
                <select
                  name="organizationId"
                  value={input.organizationId}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- เลือกองค์กร --</option>
                  {organizations.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* departmentId */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">แผนก</label>
                <select
                  name="departmentId"
                  value={input.departmentId}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- เลือกแผนก --</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* position */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">ตำแหน่ง</label>
                <input
                  type="text"
                  name="position"
                  value={input.position}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* employmentType */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">สายงาน</label>
                <select
                  name="employmentType"
                  value={input.employmentType}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
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
            <label className="block text-gray-700 mb-1 font-medium">รูปภาพ</label>
            <input
              type="file"
              name="images"
              onChange={handleChange}
              accept="image/*"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* ปุ่ม submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            {isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

          {/* ลิงก์ไป Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-red-600 hover:underline font-medium"
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
