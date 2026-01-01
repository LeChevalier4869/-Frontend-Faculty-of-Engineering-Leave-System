import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  /* ---------- StyledSelect ---------- */
  function StyledSelect({ label, name, value, onChange, options }) {
    return (
      <div className="mb-6">
        <label htmlFor={name} className="mb-2 block text-base font-semibold text-gray-800">
          {label}
        </label>
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">{`-- เลือก ${label} --`}</option>
            {options.map((opt) => (
              <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
                {opt.label ?? opt.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- map user → form ---------- */
  const mapUser = (u) => ({
    prefixName:      u?.prefixName || "",
    firstName:       u?.firstName  || "",
    lastName:        u?.lastName   || "",
    email:           u?.email      || "",
    phone:           u?.phone      || "",
    position:
      typeof u?.position === "object" ? u.position?.name ?? "" : u?.position ?? "",
    hireDate:        u?.hireDate ? new Date(u.hireDate).toISOString().slice(0, 10) : "",
    sex:             u?.sex || "",
    personnelTypeId: u?.personnelType?.id?.toString() || "",
    departmentId:    u?.department?.id?.toString()    || "",
    employmentType:  u?.employmentType || "",
  });

  /* ---------- state ---------- */
  const [formData, setFormData]       = useState(mapUser(user));
  const [departments, setDepartments] = useState([]);
  const [personnel, setPersonnel]     = useState([]);
  const [employment, setEmployment]   = useState([]);
  const [positions, setPositions]     = useState([]);

  useEffect(() => setFormData(mapUser(user)), [user]);

  /* ---------- fetch look-ups ---------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [d, p, e, pos] = await Promise.all([
          axios.get(apiEndpoints.lookupDepartments,     { headers }),
          axios.get(apiEndpoints.lookupPersonnelTypes,  { headers }),
          axios.get(apiEndpoints.lookupEmploymentTypes, { headers }),
          axios.get(apiEndpoints.lookupPositions,       { headers }),
        ]);

        setDepartments(d.data.data || []);
        setPersonnel(p.data.data   || []);

        const thMap = { ACADEMIC: "สายวิชาการ", SUPPORT: "สายสนับสนุน", OTHER: "อื่น ๆ" };
        const list  = e.data.data ?? ["ACADEMIC", "SUPPORT"];
        setEmployment(list.map((v) => ({ value: v, label: thMap[v] ?? v })));

        setPositions((pos.data.data || []).map((x) => x.name).filter(Boolean));
      } catch (err) {
        console.error("Lookup fetch error:", err);
      }
    })();
  }, []);

  /* ---------- change ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked.toString() : value }));
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token   = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        prefixName: formData.prefixName,
        firstName:  formData.firstName,
        lastName:   formData.lastName,
        email:      formData.email,
        phone:      formData.phone,
        position:   formData.position,
        hireDate:   formData.hireDate,
        sex:        formData.sex,
        personnelTypeId: +formData.personnelTypeId,
        departmentId:    +formData.departmentId,
        employmentType:  formData.employmentType,
      };

      /* --- update & รับผลกลับ (user + token) --- */
      const { data } = await axios.put(apiEndpoints.updateUser(user.id), payload, { headers });

      /* --- เซฟ token ใหม่ --- */
      if (data.token) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      }

      /* --- อัปเดต context --- */
      setUser(prev => ({ ...prev, ...data.user }));

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
      <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">แก้ไขโปรไฟล์</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ---- personal ---- */}
            <StyledSelect
              label="คำนำหน้า"
              name="prefixName"
              value={formData.prefixName}
              onChange={handleChange}
              options={[
                { value: "นาย",   label: "นาย" },
                { value: "นาง",   label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
              ]}
            />

            <Input label="ชื่อจริง"   name="firstName" value={formData.firstName} onChange={handleChange} />
            <Input label="นามสกุล"   name="lastName"  value={formData.lastName}  onChange={handleChange} />
            <Input label="อีเมล"     name="email"     value={formData.email}     onChange={handleChange} type="email" />
            <Input label="เบอร์โทรศัพท์" name="phone" value={formData.phone} onChange={handleChange} />

            <Input
              label="ตำแหน่ง"
              name="position"
              value={formData.position}
              onChange={handleChange}
              listId="posDL"
            />
            <datalist id="posDL">
              {positions.map(n => <option key={n} value={n} />)}
            </datalist>

            <Input
              label="วันที่เริ่มงาน"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
              type="date"
            />

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

            {/* ---- dept / types ---- */}
            <StyledSelect
              label="สาขา"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments}
            />

            <StyledSelect
              label="ประเภทบุคลากร"
              name="personnelTypeId"
              value={formData.personnelTypeId}
              onChange={handleChange}
              options={personnel}
            />

            <StyledSelect
              label="ประเภทพนักงาน"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={employment}
            />

          </div>

          <div className="flex justify-end gap-4">
            <Button text="ยกเลิก" onClick={() => navigate("/profile")} color="gray" />
            <Button text="บันทึก" submit color="blue" />
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function Input({ label, listId, ...rest }) {
  return (
    <div>
      <label className="mb-2 block text-base font-semibold text-gray-800">{label}</label>
      <input
        list={listId}
        {...rest}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function Checkbox({ label, ...rest }) {
  return (
    <div className="md:col-span-2 flex items-center">
      <label className="inline-flex items-center space-x-2 text-gray-800">
        <input
          type="checkbox"
          {...rest}
          className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-200"
        />
        <span className="text-base font-medium">{label}</span>
      </label>
    </div>
  );
}

function Button({ text, submit, color, onClick }) {
  const cls =
    color === "gray"
      ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
      : "bg-blue-600 hover:bg-blue-700 text-white";
  return (
    <button
      type={submit ? "submit" : "button"}
      onClick={onClick}
      className={`rounded-lg px-6 py-3 font-medium transition ${cls}`}
    >
      {text}
    </button>
  );
}
