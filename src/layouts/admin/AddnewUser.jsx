import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "../../utils/useGoBack";
import { HiOutlineChevronDown } from "react-icons/hi";
import { notify, notifySuccess, notifyError } from "../../utils/alert";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import ExcelUploadPanel from "../../components/ExcelUploadPanel";
import PropTypes from "prop-types";

const initialForm = {
  prefixName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  sex: "",
  position: "",
  personnelTypeId: "",
  organizationId: "",
  departmentId: "",
  employmentType: "",
  hireDate: "",
  positionNumber: "",
};

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

Panel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Panel.defaultProps = {
  className: "",
};

export default function AddUser() {
  const navigate = useNavigate();
  const goBack = useGoBack("/admin/manage-user");
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [personnelTypes, setPersonnelTypes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]); // fallback static จะกำหนดหลัง fetch
  const [leaveBalanceOptions, setLeaveBalanceOptions] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loadingLeaveBalanceOptions, setLoadingLeaveBalanceOptions] =
    useState(false);
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
      } catch {
        notifyError("Error", "โหลดข้อมูล lookup ล้มเหลว");
      }
    };
    fetchLookup();
  }, []);

  useEffect(() => {
    let active = true;
    setLeaveBalanceOptions([]);
    setLeaveBalances({});

    if (!formData.personnelTypeId || !formData.hireDate || !formData.sex) {
      setLoadingLeaveBalanceOptions(false);
      return () => {
        active = false;
      };
    }

    const fetchLeaveBalanceOptions = async () => {
      setLoadingLeaveBalanceOptions(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(apiEndpoints.adminLeaveBalanceOptions, {
          params: {
            personnelTypeId: formData.personnelTypeId,
            hireDate: formData.hireDate,
            sex: formData.sex,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setLeaveBalanceOptions(res.data.data || []);
        }
      } catch (err) {
        if (active) {
          notifyError(
            "โหลดสิทธิ์วันลาไม่สำเร็จ",
            err.response?.data?.message || "กรุณาลองเลือกข้อมูลการทำงานอีกครั้ง",
          );
        }
      } finally {
        if (active) setLoadingLeaveBalanceOptions(false);
      }
    };

    fetchLeaveBalanceOptions();
    return () => {
      active = false;
    };
  }, [formData.personnelTypeId, formData.hireDate, formData.sex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrefixNameChange = (e) => {
    const prefixName = e.target.value;
    const sex = prefixName === "นาย" ? "ชาย" : "หญิง";
    setFormData((prev) => ({ ...prev, prefixName, sex }));
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const renderDropdown = (
    label,
    name,
    options,
    { required = true, optional = false, onChange = handleChange } = {},
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-slate-800">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={onChange}
          required={required}
          className="appearance-none w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="" disabled={!optional}>
            {optional ? `-- ไม่เลือก${label} --` : `-- เลือก${label} --`}
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

  const handleOrganizationChange = (e) => {
    const organizationId = e.target.value;
    setFormData((prev) => {
      const selectedDepartment = departments.find(
        (department) => String(department.id) === String(prev.departmentId),
      );
      const departmentMatchesOrganization =
        !organizationId ||
        !selectedDepartment ||
        String(selectedDepartment.organizationId) === String(organizationId);

      return {
        ...prev,
        organizationId,
        ...(departmentMatchesOrganization ? {} : { departmentId: "" }),
      };
    });
  };

  const filteredDepartments = formData.organizationId
    ? departments.filter(
        (department) =>
          String(department.organizationId) === String(formData.organizationId),
      )
    : departments;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        fd.append(k, v);
      });
      fd.append("leaveBalances", JSON.stringify(leaveBalances));
      if (selectedFile) fd.append("profilePicture", selectedFile);

      const token = localStorage.getItem("accessToken");
      const res = await axios.post(apiEndpoints.createUserByAdmin, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const warnings = res.data?.warnings || [];
      if (warnings.length) {
        notify(
          "warning",
          "เพิ่มผู้ใช้งานสำเร็จ แต่มีบางยอดใช้ค่าเริ่มต้น",
          warnings.join("\n"),
        ).then(() => navigate("/admin/manage-user"));
      } else {
        notifySuccess("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว").then(
          () => navigate("/admin/manage-user"),
        );
      }
    } catch (err) {
      notifyError(
        "ผิดพลาด",
        err.response?.data?.message || "ไม่สามารถเพิ่มผู้ใช้งานได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-2 bg-white text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-slate-400";
  const remainingBalanceOptions = leaveBalanceOptions.filter(
    (option) => !option.isNonDeductible,
  );
  const usedDaysOptions = leaveBalanceOptions.filter(
    (option) => option.isNonDeductible,
  );
  const renderLeaveBalanceFields = (options, isUsedDays) =>
    options.length ? (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option) => (
          <div
            key={option.leaveTypeId}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <label
              htmlFor={`leave-balance-${option.leaveTypeId}`}
              className="block text-sm font-medium text-slate-800"
            >
              {option.name}
            </label>
            <p className="mt-1 text-xs text-slate-500">
              {isUsedDays
                ? "นับจำนวนวันที่ใช้ไปแล้ว โดยไม่หักยอดคงเหลือ"
                : `ค่าเริ่มต้น ${option.defaultDays} วัน · สิทธิ์สูงสุด ${option.maxDays} วัน`}
            </p>
            <input
              id={`leave-balance-${option.leaveTypeId}`}
              type="number"
              min="0"
              step="1"
              max={isUsedDays ? undefined : option.maxDays}
              value={leaveBalances[option.leaveTypeId] ?? ""}
              onChange={(e) =>
                setLeaveBalances((prev) => ({
                  ...prev,
                  [option.leaveTypeId]: e.target.value,
                }))
              }
              className={`${inputClass} mt-3`}
              placeholder={
                isUsedDays
                  ? "เว้นว่าง = 0 วัน"
                  : `เว้นว่าง = ${option.defaultDays} วัน`
              }
            />
          </div>
        ))}
      </div>
    ) : (
      <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-500">
        ไม่มีประเภทลาในกลุ่มนี้สำหรับพนักงาน
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8 font-kanit rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-700">
              Admin View
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              เพิ่มผู้ใช้งานใหม่
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              สร้างบัญชีผู้ใช้ให้บุคลากรใหม่
              โดยกรอกข้อมูลส่วนตัวและข้อมูลการทำงาน หรืออัปโหลดไฟล์ Excel
              (หลายคน)
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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* คำนำหน้า */}
                <div className="md:col-span-2">
                  {renderDropdown(
                    "คำนำหน้า",
                    "prefixName",
                    [
                      { value: "นาย", label: "นาย" },
                      { value: "นางสาว", label: "นางสาว" },
                      { value: "นาง", label: "นาง" },
                    ],
                    { onChange: handlePrefixNameChange },
                  )}
                </div>

                {/* ชื่อจริง */}
                <div className="md:col-span-4">
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

                {/* นามสกุล */}
                <div className="md:col-span-4">
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

                {/* เพศ */}
                <div className="md:col-span-2">
                  {renderDropdown("เพศ", "sex", [
                    { value: "ชาย", label: "ชาย" },
                    { value: "หญิง", label: "หญิง" },
                  ])}
                </div>

                {/* รูปโปรไฟล์ */}
                <div className="md:col-span-12">
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
                    placeholder="example@rmuti.ac.th"
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
                  personnelTypes.map((pt) => ({
                    value: pt.id,
                    label: pt.name,
                  })),
                )}
                {renderDropdown(
                  "องค์กร",
                  "organizationId",
                  organizations.map((o) => ({ value: o.id, label: o.name })),
                  {
                    required: false,
                    optional: true,
                    onChange: handleOrganizationChange,
                  },
                )}
                {renderDropdown(
                  "แผนก",
                  "departmentId",
                  filteredDepartments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  })),
                )}
                {renderDropdown(
                  "ประเภทพนักงาน",
                  "employmentType",
                  employmentTypes,
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
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    ตำแหน่งงาน
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="เช่น อาจารย์ / นักวิชาการศึกษา"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-800">
                    เลขที่ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    name="positionNumber"
                    value={formData.positionNumber}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="เช่น ENG-001"
                  />
                </div>
              </div>
            </section>

            {/* Leave Balance */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-slate-900">
                        กำหนดยอดวันลา
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          (ไม่บังคับ)
                        </span>
                      </span>
                      <HiOutlineChevronDown
                        size={18}
                        className="shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                      />
                    </div>
                    <span className="text-sm text-slate-500">
                      {leaveBalanceOptions.length > 0
                        ? `${leaveBalanceOptions.length} ประเภทลา`
                        : "คลิกเพื่อกำหนดยอดเอง"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    เว้นช่องว่างเพื่อใช้ค่าเริ่มต้นตามประเภทบุคลากรและอายุงาน
                  </p>
                </summary>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  {loadingLeaveBalanceOptions ? (
                    <p className="text-sm text-slate-600">
                      กำลังโหลดสิทธิ์วันลาตามข้อมูลพนักงาน...
                    </p>
                  ) : !formData.personnelTypeId ||
                    !formData.hireDate ||
                    !formData.sex ? (
                    <p className="text-sm text-slate-600">
                      เลือกประเภทบุคลากร เพศ และวันที่เริ่มงานก่อน
                      เพื่อแสดงประเภทลาและสิทธิ์ที่ตรงกับพนักงาน
                    </p>
                  ) : leaveBalanceOptions.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      ไม่พบสิทธิ์วันลาที่กำหนดไว้สำหรับข้อมูลพนักงานนี้
                    </p>
                  ) : (
                    <div className="space-y-5">
                      <p className="mb-4 text-sm text-slate-600">
                        กรอกเฉพาะยอดที่ต้องการกำหนดเอง
                        ระบบจะใช้ค่าเริ่มต้นในช่องที่เว้นว่าง
                      </p>
                      <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-800">
                          วันลาคงเหลือ
                        </h4>
                        {renderLeaveBalanceFields(remainingBalanceOptions, false)}
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-1 text-sm font-semibold text-slate-800">
                          วันที่ใช้ไปแล้ว
                        </h4>
                        <p className="mb-3 text-xs text-slate-500">
                          สำหรับประเภทลาที่นับจำนวนโดยไม่หักวันลาคงเหลือ
                        </p>
                        {renderLeaveBalanceFields(usedDaysOptions, true)}
                      </section>
                    </div>
                  )}
                </div>
              </details>
            </section>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition ${
                  loading
                    ? "bg-brand-300 cursor-not-allowed"
                    : "bg-brand-600 hover:bg-brand-500"
                }`}
              >
                {loading ? "กำลังบันทึก..." : "บันทึกผู้ใช้งาน"}
              </button>
            </div>
          </form>
        </Panel>
        <ExcelUploadPanel
          title="เพิ่มผู้ใช้จากไฟล์ Excel"
          description="อัปโหลดไฟล์ Excel เพื่อเพิ่มผู้ใช้หลายคน"
          uploadUrl={apiEndpoints.uploadUserExcel}
          templatePath="/Add_Users_Template.xlsx"
          exampleTemplatePath="/Add_Users_Template_Example.xlsx"
          templateName="Add_Users_Template.xlsx"
          exampleTemplateName="Add_Users_Template_Example.xlsx"
          onSuccess={(result) => {
            console.log("UPLOAD RESULT:", result);
          }}
        />
      </div>
    </div>
  );
}
