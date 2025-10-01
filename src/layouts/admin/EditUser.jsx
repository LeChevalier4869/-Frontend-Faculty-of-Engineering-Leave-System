import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialForm = {
    prefixName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sex: "",
    personnelTypeId: "",
    departmentId: "",
    employmentType: "",
    hireDate: "",
    position: "",
    inActiveRaw: "false",
  };

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  // const [employmentTypes, setEmploymentTypes] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        // const [userRes, deptRes, ptRes, empRes] = await Promise.all([
        const [userRes, deptRes, ptRes] = await Promise.all([
          axios.get(apiEndpoints.getUserByIdAdmin(id), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(apiEndpoints.lookupDepartments),
          axios.get(apiEndpoints.lookupPersonnelTypes),
          // axios.get(apiEndpoints.lookupEmploymentTypes),
        ]);

        const u = userRes.data.data;

        setFormData({
          prefixName: u.prefixName || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          phone: u.phone || "",
          sex: u.sex || "",
          personnelTypeId: u.personnelTypeId || "",
          departmentId: u.departmentId || "",
          employmentType: u.employmentType || "",
          hireDate: u.hireDate?.substring(0, 10) || "",
          position: u.position || "",
          inActiveRaw: u.inActive ? "true" : "false",
        });

        setDepartments(deptRes.data.data);
        setPersonnelTypes(ptRes.data.data);
        // const emp = empRes.data.data ?? ["ACADEMIC", "SUPPORT"];
        // setEmploymentTypes(emp.map((e) => ({ value: e, label: e })));
      } catch (err) {
        console.error(err);
        Swal.fire("ไม่พบผู้ใช้งาน", "", "error").then(() =>
          navigate("/admin/manage-user")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      // convert inActiveRaw → inActive boolean
      const payload = {
        ...formData,
        inActive: formData.inActiveRaw === "true"
      };
      delete payload.inActiveRaw;

      await axios.put(
        apiEndpoints.updateUserByIdAdmin(id),
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire(
        "อัปเดตสำเร็จ",
        "ข้อมูลผู้ใช้งานได้รับการอัปเดตแล้ว",
        "success"
      ).then(() => navigate("/admin/manage-user"));
    } catch (err) {
      console.error(err);
      Swal.fire(
        "อัปเดตล้มเหลว",
        err.response?.data?.message || "ไม่สามารถอัปเดตได้",
        "error"
      );
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
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- เลือก{label} --</option>
          {options.map((opt) => (
            <option key={opt.id || opt.value} value={opt.id || opt.value}>
              {opt.name || opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          แก้ไขผู้ใช้งาน
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["prefixName", "คำนำหน้า"],
              ["firstName", "ชื่อจริง"],
              ["lastName", "นามสกุล"],
              ["email", "อีเมล"],
              ["phone", "เบอร์โทรศัพท์"],
              ["position", "ตำแหน่ง"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1 text-black">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              { value: "ชาย", label: "ชาย" },
              { value: "หญิง", label: "หญิง" },
            ])}
            {renderDropdown("ประเภทบุคลากร", "personnelTypeId", personnelTypes)}
            {renderDropdown("แผนก", "departmentId", departments)}
            {/* {renderDropdown("ประเภทพนักงาน", "employmentType", employmentTypes)} */}
            {renderDropdown("ประเภทพนักงาน", "employmentType", [
              { value: "ACADEMIC", label: "สายวิชาการ" },
              { value: "SUPPORT", label: "สายสนับสนุน" },
            ])}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/manage-user")}
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