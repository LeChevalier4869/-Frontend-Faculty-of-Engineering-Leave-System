import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../utils/api";

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
    images: "",
    employmentType: ""
  });

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiEndpoints.register, input);
      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <h1 className="text-5xl font-bold text-white mb-8">ระบบลาคณะวิศกรรมศาสตร์</h1>
      <div className="bg-white p-10 rounded-lg shadow-lg w-104">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">สมัครสมาชิก</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: "คำนำหน้า", name: "prefixName" },
            { label: "ชื่อ", name: "firstName" },
            { label: "นามสกุล", name: "lastName" },
            { label: "เพศ", name: "sex" },
            { label: "อีเมล", name: "email", type: "email" },
            { label: "รหัสผ่าน", name: "password", type: "password" },
            { label: "เบอร์โทรศัพท์", name: "phone" },
            { label: "วันที่จ้างงาน", name: "hireDate", type: "date" },
            { label: "ประเภทบุคลากร", name: "personnelTypeId" },
            { label: "องค์กร", name: "organizationId" },
            { label: "แผนก", name: "departmentId" },
            { label: "รูปภาพ", name: "images", type: "file" },
            { label: "ประเภทการจ้างงาน", name: "employmentType" }
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block text-gray-600 font-medium text-lg">{label}:</label>
              <input
                type={type}
                name={name}
                value={input[name]}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              />
            </div>
          ))}
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg"
          >
            สมัครสมาชิก
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">มีบัญชีอยู่แล้ว? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/")}>
            เข้าสู่ระบบ
          </span></p>
        </div>
      </div>
    </div>
  );
}
