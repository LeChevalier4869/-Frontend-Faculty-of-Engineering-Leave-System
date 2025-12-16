import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      const payload = {
        ...formData,
        inActive: formData.inActiveRaw === "true",
      };
      delete payload.inActiveRaw;

      await axios.put(apiEndpoints.updateUserByIdAdmin(id), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
            className="w-4 h-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center font-kanit text-slate-700 px-4 rounded-2xl">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
            </div>
            <span className="font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              แก้ไขข้อมูลผู้ใช้งาน
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              ปรับปรุงข้อมูลส่วนตัว แผนก และประเภทบุคลากรของผู้ใช้งานในระบบ
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Panel className="p-6 sm:p-8">
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
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder={label}
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  วันที่เริ่มงาน
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {renderDropdown("เพศ", "sex", [
                { value: "ชาย", label: "ชาย" },
                { value: "หญิง", label: "หญิง" },
              ])}
              {renderDropdown(
                "ประเภทบุคลากร",
                "personnelTypeId",
                personnelTypes
              )}
              {renderDropdown("แผนก", "departmentId", departments)}
              {/* {renderDropdown("ประเภทพนักงาน", "employmentType", employmentTypes)} */}
              {renderDropdown("ประเภทพนักงาน", "employmentType", [
                { value: "ACADEMIC", label: "สายวิชาการ" },
                { value: "SUPPORT", label: "สายสนับสนุน" },
              ])}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/manage-user")}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white shadow-sm transition"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
