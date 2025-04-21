// Register.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiEndpoints } from "../../utils/api";
import { FaRegAddressCard, FaCog } from "react-icons/fa";
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

  const [isNavigating, setIsNavigating] = useState(false);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, orgRes, perTypeRes] = await Promise.all([
          axios.get(apiEndpoints.departments),
          axios.get(apiEndpoints.organizations),
          axios.get(apiEndpoints.personnelTypes),
        ]);
    
        console.log("✅ personnelTypes =", perTypeRes?.data); // Debug ตรงนี้ดูด้วย
    
        setDepartments(deptRes.data?.data || []);
        setOrganizations(orgRes.data?.data || []);
        setPersonnelTypes(perTypeRes?.data?.data || []); // 🔥 จุดนี้ที่ error
      } catch (err) {
        console.error("❌ ดึงข้อมูล dropdowns ล้มเหลว:", err);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
      navigate("/login");
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl my-10">
        <div className="flex justify-center mb-4">
          <FaRegAddressCard className="text-red-500 text-5xl" />
        </div>

        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
          สมัครสมาชิก
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Fields */}
          {[
            { label: "คำนำหน้า", name: "prefixName" },
            { label: "ชื่อ", name: "firstName" },
            { label: "นามสกุล", name: "lastName" },
            { label: "เพศ", name: "sex" },
            { label: "อีเมล", name: "email", type: "email" },
            { label: "รหัสผ่าน", name: "password", type: "password" },
            { label: "เบอร์โทรศัพท์", name: "phone" },
            { label: "วันที่จ้างงาน", name: "hireDate", type: "date" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block text-gray-700 mb-1 font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={input[name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          ))}

          {/* Select Dropdowns */}
          {[
            {
              label: "ประเภทบุคลากร",
              name: "personnelTypeId",
              data: personnelTypes,
              defaultOption: "-- กรุณาเลือกประเภทบุคลากร --",
            },
            {
              label: "องค์กร",
              name: "organizationId",
              data: organizations,
              defaultOption: "-- กรุณาเลือกองค์กร --",
            },
            {
              label: "แผนก",
              name: "departmentId",
              data: departments,
              defaultOption: "-- กรุณาเลือกแผนก --",
            },
          ].map(({ label, name, data, defaultOption, useValueName }) => (
            <div key={name}>
              <label className="block text-gray-700 mb-1 font-medium">{label}</label>
              <select
                name={name}
                value={input[name]}
                onChange={handleChange}
                required
                className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">{defaultOption}</option>
                {data.map((item) => (
                  <option
                    key={item.id}
                    value={useValueName ? item.name : item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          { /* Position */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">ตำแหน่งงาน</label>
            <input
              type="text"
              name="position"
              value={input.position}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>


          {/* Employment Type */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">สายงาน</label>
            <select
              name="employmentType"
              value={input.employmentType}
              onChange={handleChange}
              required
              className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">-- กรุณาเลือกสายงาน --</option>
              <option value="ACADEMIC">สายวิชาการ</option>
              <option value="SUPPORT">สายสนับสนุน</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">รูปภาพ</label>
            <input
              type="file"
              name="images"
              onChange={handleChange}
              accept="image/*"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition duration-300 font-medium"
          >
            สมัครสมาชิก
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              className="text-rose-600 font-medium cursor-pointer hover:underline disabled:opacity-50"
              disabled={isNavigating}
              onClick={() => {
                setIsNavigating(true);
                setTimeout(() => navigate("/"), 1500);
              }}
            >
              {isNavigating ? (
                <span className="flex items-center justify-center gap-2">
                  <FaCog className="animate-spin h-4 w-4 text-rose-600" />
                  กำลังโหลด...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
