/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import Swal, { notifySuccess, notifyError } from "../../utils/alert";
import { apiEndpoints } from "../../utils/api";
import { FaCog } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function ConfigPage() {
  const [contacts, setContacts] = useState({
    AdminName: "",
    AdminPhone: "",
    AdminMail: "",
  });
  const [initialContacts, setInitialContacts] = useState({
    AdminName: "",
    AdminPhone: "",
    AdminMail: "",
  });
  const [driveLink, setDriveLink] = useState("");
  const [initialDriveLink, setInitialDriveLink] = useState("");
  const [leaveInformationUrl, setLeaveInformationUrl] = useState("");
  const [initialLeaveInformationUrl, setInitialLeaveInformationUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
      throw new Error("No token");
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showAlert = (icon, title, text = "", timer = null) => {
    // ป็อปอัพแจ้งผล: สำเร็จ = เด้งปิดเอง, ผิดพลาด = มีปุ่มปิด (ให้เหมือนกันทั้งระบบ)
    if (icon === "success") {
      notifySuccess(title, text);
      return;
    }
    if (icon === "error") {
      notifyError(title, text);
      return;
    }
    Swal.fire({
      icon,
      title,
      text,
      timer: timer || undefined,
      showConfirmButton: timer ? false : true,
    });
  };

  const isValidDriveLink = (link) => {
    if (!link || !link.trim()) return false;
    const regex =
      /^https?:\/\/(www\.)?drive\.google\.com\/(file\/d\/[\w-]+\/view(\?usp=sharing)?|open\?id=[\w-]+|drive\/folders\/[\w-]+)/;
    return regex.test(link);
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${apiEndpoints.getContact}`);
      const data = res.data;
      const map = {};
      data.forEach((item) => {
        map[item.key] = item.value;
      });
      const loaded = {
        AdminName: map.AdminName || "",
        AdminPhone: map.AdminPhone || "",
        AdminMail: map.AdminMail || "",
      };
      setContacts(loaded);
      setInitialContacts(loaded);
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        "โหลดข้อมูลไม่สำเร็จ",
        "ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveLink = async () => {
    try {
      const res = await axios.get(apiEndpoints.getDriveLink, authHeader());
      if (res.data?.url) {
        setDriveLink(res.data.url);
        setInitialDriveLink(res.data.url);
      }
    } catch (err) {
      console.error("ไม่สามารถโหลดลิงก์ Google Drive:", err);
    }
  };

  const fetchLeaveInformationUrl = async () => {
    try {
      const res = await axios.get(apiEndpoints.getSettingByKey('leave_information'));
      if (res.data?.data?.value) {
        setLeaveInformationUrl(res.data.data.value);
        setInitialLeaveInformationUrl(res.data.data.value);
      }
    } catch (err) {
      console.error("ไม่สามารถโหลดลิงก์ข้อมูลการลา:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchDriveLink();
    fetchLeaveInformationUrl();
  }, []);

  const handleSaveContacts = async () => {
    try {
      setSaving(true);

      const hasEmpty = Object.values(contacts).some((v) => !v || !v.trim());
      if (hasEmpty) {
        showAlert("warning", "กรุณากรอกข้อมูลให้ครบถ้วน");
        setSaving(false);
        return;
      }

      const keys = ["AdminName", "AdminPhone", "AdminMail"];
      for (const key of keys) {
        await axios.put(
          apiEndpoints.updateAdminContact(key),
          { value: contacts[key] },
          authHeader()
        );
      }

      setInitialContacts({ ...contacts });
      showAlert(
        "success",
        "บันทึกสำเร็จ",
        "อัปเดตข้อมูลเจ้าหน้าที่เรียบร้อยแล้ว",
        1500
      );
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        "เกิดข้อผิดพลาด",
        "ไม่สามารถบันทึกข้อมูลเจ้าหน้าที่ได้"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDriveLink = async () => {
    if (!driveLink?.trim()) {
      showAlert("warning", "กรุณากรอกลิงก์ก่อน");
      return;
    }

    if (!isValidDriveLink(driveLink)) {
      showAlert("warning", "กรุณากรอกลิงก์ Google Drive ที่ถูกต้อง");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        apiEndpoints.updateDriveLink,
        { value: driveLink },
        authHeader()
      );
      setInitialDriveLink(driveLink);
      showAlert("success", "บันทึกลิงก์สำเร็จ", "", 1500);
    } catch (err) {
      console.error(err);
      showAlert("error", "เกิดข้อผิดพลาด", "ไม่สามารถบันทึกลิงก์ได้");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLeaveInformationUrl = async () => {
    if (!leaveInformationUrl?.trim()) {
      showAlert("warning", "กรุณากรอกลิงก์ข้อมูลการลาก่อน");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        apiEndpoints.updateSettingByKey('leave_information'),
        {
          value: leaveInformationUrl,
          type: 'url',
          description: 'สิทธิประโยชน์ว่าด้วยการลา'
        },
        authHeader()
      );
      setInitialLeaveInformationUrl(leaveInformationUrl);
      showAlert("success", "บันทึกลิงก์ข้อมูลการลาสำเร็จ", "", 1500);
    } catch (err) {
      console.error(err);
      showAlert("error", "เกิดข้อผิดพลาด", "ไม่สามารถบันทึกลิงก์ข้อมูลการลาได้");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "px-4 py-2 rounded-xl border bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 border-slate-300 placeholder:text-slate-400";

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดหน้าตั้งค่าระบบ..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-4 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">
              System Configuration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center border border-brand-200">
              <FaCog className="text-xl text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                ตั้งค่าระบบ
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                จัดการข้อมูลติดต่อเจ้าหน้าที่และลิงก์ดาวน์โหลดเอกสารต่าง ๆ
                ของระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
            ข้อมูลติดต่อเจ้าหน้าที่
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { label: "ชื่อเจ้าหน้าที่", key: "AdminName", type: "text" },
              { label: "เบอร์โทรศัพท์", key: "AdminPhone", type: "text" },
              { label: "อีเมล", key: "AdminMail", type: "email" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col">
                <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-[0.15em]">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={contacts[field.key]}
                  onChange={(e) =>
                    setContacts({ ...contacts, [field.key]: e.target.value })
                  }
                  className={`${inputBase} ${
                    !contacts[field.key]?.trim()
                      ? "border-rose-300"
                      : "border-slate-300"
                  }`}
                  placeholder={`กรอก${field.label}`}
                  required
                />
                {!contacts[field.key]?.trim() && (
                  <span className="text-rose-500 text-xs mt-1">
                    กรุณากรอก{field.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveContacts}
              disabled={saving || JSON.stringify(contacts) === JSON.stringify(initialContacts)}
              className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-150 shadow-sm ${
                saving || JSON.stringify(contacts) === JSON.stringify(initialContacts)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลเจ้าหน้าที่"}
            </button>
          </div>
        </Panel>

        {/* Drive Link */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
            ลิงก์ดาวน์โหลดใบลา (Google Drive)
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <input
              type="text"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="วางลิงก์ Google Drive ที่นี่"
              className={`${inputBase} flex-1`}
            />

            <button
              type="button"
              onClick={() => driveLink && window.open(driveLink, "_blank")}
              className="mt-3 md:mt-0 px-6 py-2 rounded-xl font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all duration-150 shadow-sm"
            >
              เปิดลิงก์
            </button>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveDriveLink}
              disabled={saving || driveLink === initialDriveLink}
              className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-150 shadow-sm ${
                saving || driveLink === initialDriveLink
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกลิงก์"}
            </button>
          </div>
        </Panel>

        {/* Leave Information Link */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
            ลิงก์ข้อมูลสิทธิประโยชน์การลา
          </h2>

          <div className="mb-4">
            <p className="text-sm text-slate-600">
              ลิงก์นี้จะแสดงในหน้า Leave2 สำหรับให้ผู้ใช้ตรวจสอบข้อมูลสิทธิประโยชน์และเงื่อนไขการลาต่างๆ
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <input
              type="text"
              value={leaveInformationUrl}
              onChange={(e) => setLeaveInformationUrl(e.target.value)}
              placeholder="วางลิงก์ข้อมูลสิทธิประโยชน์การลาที่นี่"
              className={`${inputBase} flex-1`}
            />

            <button
              type="button"
              onClick={() => leaveInformationUrl && window.open(leaveInformationUrl, "_blank")}
              className="mt-3 md:mt-0 px-6 py-2 rounded-xl font-medium text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all duration-150 shadow-sm"
            >
              เปิดลิงก์
            </button>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveLeaveInformationUrl}
              disabled={saving || leaveInformationUrl === initialLeaveInformationUrl}
              className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-150 shadow-sm ${
                saving || leaveInformationUrl === initialLeaveInformationUrl
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกลิงก์ข้อมูลการลา"}
            </button>
          </div>
        </Panel>


      </div>
    </div>
  );
}
