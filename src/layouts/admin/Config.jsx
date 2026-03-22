import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { FaCog, FaSync, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function ConfigPage() {
  // Role checking for superadmin access
  const isSuperAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.roles?.includes('SUPER_ADMIN') || false;
  };

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

  // Fiscal Year states
  const [fiscalYear, setFiscalYear] = useState({ fiscalYear: null, currentYear: null });
  const [resetLoading, setResetLoading] = useState(false);
  const [yearInputs, setYearInputs] = useState({ fiscalYear: "", currentYear: "" });
  const [deleteYearInput, setDeleteYearInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);

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
    fetchFiscalYear();
    fetchAvailableYears();
  }, []);

  const fetchAvailableYears = async () => {
    try {
      setYearsLoading(true);
      const res = await axios.get(apiEndpoints.getAvailableYears, authHeader());
      setAvailableYears(res.data.data || []);
    } catch (err) {
      console.error("ไม่สามารถโหลดข้อมูลปีที่มีในระบบ:", err);
    } finally {
      setYearsLoading(false);
    }
  };

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

  // Fiscal Year functions
  const fetchFiscalYear = async () => {
    try {
      const res = await axios.get(apiEndpoints.getFiscalYear, authHeader());
      setFiscalYear(res.data.data);
      setYearInputs({
        fiscalYear: res.data.data.fiscalYear?.toString() || "",
        currentYear: res.data.data.currentYear?.toString() || ""
      });
    } catch (err) {
      console.error("ไม่สามารถโหลดข้อมูลปีงบประมาณ:", err);
    }
  };

  const handleResetLeaveBalance = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการรีเซ็ตยอดวันลา?",
      html: `
        <div class="text-left">
          <p class="mb-2">การดำเนินการนี้จะ:</p>
          <ul class="text-sm text-left text-slate-600">
            <li>• ลบและสร้างยอดวันลาใหม่สำหรับทุกคน</li>
            <li>• ทบยอดวันลาพักผ่อนที่เหลือจากปีก่อน (ถ้ามี)</li>
            <li>• กำหนดยอดวันลาตามสิทธิ์ประจำตำแหน่ง</li>
            <li>• รีเซ็ตข้อมูลสิทธิ์ประจำตำแหน่งทั้งหมด เพื่อจับคู่ใหม่เมื่ออายุงานเพิ่มขึ้น (บางประเภท)</li>
          </ul>
          <p class="mt-3 text-amber-600 font-medium">
            ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "ยืนยันรีเซ็ต",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setResetLoading(true);
      const res = await axios.post(apiEndpoints.resetLeaveBalance, {}, authHeader());

      await Swal.fire({
        title: "รีเซ็ตสำเร็จ!",
        html: `
          <div class="text-left">
            <p class="mb-2">✅ รีเซ็ตยอดวันลาเรียบร้อยแล้ว</p>
            <p class="text-sm text-slate-600">เวลาดำเนินการ: ${res.data.timestamp}</p>
          </div>
        `,
        icon: "success",
        timer: 3000,
        timerProgressBar: true
      });

      // Refresh fiscal year data
      await fetchFiscalYear();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถรีเซ็ตยอดวันลาได้ กรุณาลองใหม่",
        icon: "error"
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdateFiscalYear = async () => {
    if (!yearInputs.fiscalYear || !yearInputs.currentYear) {
      showAlert("warning", "กรุณากรอกข้อมูลปีให้ครบถ้วน");
      return;
    }

    const result = await Swal.fire({
      title: "ยืนยันการอัปเดตปีงบประมาณ?",
      html: `
        <div class="text-left">
          <p class="mb-3">คุณกำลังจะอัปเดตข้อมูลปีดังนี้:</p>
          <div class="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">ปีงบประมาณ:</span>
              <span class="font-medium text-slate-900">${yearInputs.fiscalYear}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">ปีปฏิทิน:</span>
              <span class="font-medium text-slate-900">${yearInputs.currentYear}</span>
            </div>
          </div>
          <p class="mt-3 text-amber-600 font-medium text-sm">
            ⚠️ การเปลี่ยนแปลงอาจส่งผลต่อการคำนวณวันหยุด
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "ยืนยันอัปเดต",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await axios.put(apiEndpoints.updateFiscalYear, {
        fiscalYear: parseInt(yearInputs.fiscalYear),
        currentYear: parseInt(yearInputs.currentYear)
      }, authHeader());

      showAlert("success", "อัปเดตปีงบประมาณสำเร็จ", "", 1500);
      await fetchFiscalYear();
    } catch (err) {
      console.error(err);
      showAlert("error", "เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตปีงบประมาณได้");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLeaveBalanceByYear = async () => {
    if (!deleteYearInput || !deleteYearInput.trim()) {
      showAlert("warning", "กรุณาระบุปีที่ต้องการลบ");
      return;
    }

    const year = parseInt(deleteYearInput);
    if (isNaN(year) || year < 2000 || year > 2100) {
      showAlert("warning", "กรุณาระบุปีที่ถูกต้อง (ค.ศ. 2000-2100)");
      return;
    }

    const result = await Swal.fire({
      title: "⚠️ ยืนยันการลบข้อมูล?",
      html: `
        <div class="text-left">
          <p class="mb-3">คุณกำลังจะลบข้อมูล LeaveBalance ทั้งหมดสำหรับ:</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p class="font-semibold text-red-800 text-center">ปี ${year}</p>
          </div>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="font-medium text-amber-800 mb-2">⚠️ คำเตือน:</p>
            <ul class="text-sm text-amber-700 space-y-1">
              <li>• การลบนี้ไม่สามารถย้อนกลับได้</li>
              <li>• จะลบข้อมูลวันหยุดของพนักงานทั้งหมดในปี ${year}</li>
              <li>• อาจส่งผลกระทบต่อรายงานและการคำนวณ</li>
            </ul>
          </div>
        </div>
      `,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "ลบข้อมูลถาวร",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setDeleteLoading(true);
      const res = await axios.delete(apiEndpoints.deleteLeaveBalanceByYear(year), authHeader());

      await Swal.fire({
        title: "ลบข้อมูลสำเร็จ!",
        html: `
          <div class="text-left">
            <p class="mb-2">✅ ลบข้อมูล LeaveBalance ปี ${year} เรียบร้อยแล้ว</p>
            <p class="text-sm text-slate-600">จำนวนที่ลบ: ${res.data.deletedCount} รายการ</p>
            <p class="text-xs text-slate-500 mt-2">เวลา: ${res.data.timestamp}</p>
          </div>
        `,
        icon: "success",
        timer: 3000,
        timerProgressBar: true
      });

      setDeleteYearInput("");
      // Refresh available years after deletion
      await fetchAvailableYears();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "ไม่สามารถลบข้อมูลได้";
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: message,
        icon: "error"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputBase =
    "px-4 py-2 rounded-xl border bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 border-slate-300 placeholder:text-slate-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center font-kanit text-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
            </div>
            <span className="font-medium">กำลังโหลดหน้าตั้งค่าระบบ...</span>
            <span className="text-xs text-slate-500">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-4 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-sky-700">
              System Configuration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center border border-sky-200">
              <FaCog className="text-xl text-sky-600" />
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
              className="mt-3 md:mt-0 px-6 py-2 rounded-xl font-medium text-sm text-white bg-sky-600 hover:bg-sky-500 transition-all duration-150 shadow-sm"
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
              className="mt-3 md:mt-0 px-6 py-2 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all duration-150 shadow-sm"
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

        {/* Extra section placeholder */}
        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
            ตั้งค่าอื่น ๆ (เช่น ฟอร์ม, รายงาน)
          </h2>
          <p className="text-sm text-slate-500 italic">
            ยังไม่มีข้อมูลในส่วนนี้ คุณสามารถเพิ่มฟอร์ม ปุ่ม
            หรือการตั้งค่าอื่น ๆ เพิ่มเติมได้ภายหลัง
          </p>
        </Panel>

        {/* Leave Balance Reset Section */}
        <Panel className="p-6 sm:p-8 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200">
              <FaSync className="text-xl text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                จัดการการรีเซ็ตยอดวันหยุดประจำปี
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                รีเซ็ตยอดวันหยุดเมื่อเริ่มต้นปีงบประมาณใหม่ (1 ตุลาคม)
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">โปรดระมัดระวังในการแก้ไข</h3>
                <p className="text-xs text-amber-700">
                  การรีเซ็ตยอดวันลาอาจทำให้ข้อมูลสิทธิ์การลาของผู้ใช้ทั้งระบบเสียหายได้
                  กรุณาตรวจสอบให้แน่ใจก่อนทำการเปลี่ยนแปลง
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Fiscal Year Info */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <FaCalendarAlt className="text-sky-600" />
                <h3 className="font-medium text-slate-900">ข้อมูลปีปัจจุบัน</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">ปีงบประมาณ:</span>
                  <span className="font-medium text-slate-900">
                    {fiscalYear.fiscalYear || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ปีปฏิทิน:</span>
                  <span className="font-medium text-slate-900">
                    {fiscalYear.currentYear || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Update Fiscal Year */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <FaCog className="text-sky-600" />
                <h3 className="font-medium text-slate-900">อัปเดตปีงบประมาณ</h3>
              </div>
              <div className="space-y-3">
                <div className="text-xs text-slate-500 bg-sky-50 rounded-lg p-2">
                  <p className="font-medium text-sky-700 mb-1">📝 คำอธิบายการใช้งาน:</p>
                  <ul className="space-y-1 text-sky-600">
                    <li>• <strong>ปีงบฯ:</strong> ปีงบประมาณสำหรับคำนวณวันหยุด (1 ต.ค. - 30 ก.ย.)</li>
                    <li>• <strong>ปีปฏิทิน:</strong> ปีปฏิทินปกติสำหรับวันหยุดประจำปี</li>
                    <li>• <strong>อัตโนมัติ:</strong> ระบบจะอัปเดตอัตโนมัติเมื่อขึ้นปีงบประมาณใหม่ (1 ต.ค.)</li>
                    <li>• <strong>แก้ไข:</strong> ใช้เมื่อต้องแก้ไขปีที่ตั้งค่าผิดพลาดเท่านั้น</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="ปีงบฯ"
                    value={yearInputs.fiscalYear}
                    onChange={(e) => setYearInputs({...yearInputs, fiscalYear: e.target.value})}
                    className={`${inputBase} text-xs`}
                  />
                  <input
                    type="number"
                    placeholder="ปีปฏิทิน"
                    value={yearInputs.currentYear}
                    onChange={(e) => setYearInputs({...yearInputs, currentYear: e.target.value})}
                    className={`${inputBase} text-xs`}
                  />
                </div>
                <button
                  onClick={handleUpdateFiscalYear}
                  disabled={saving}
                  className={`w-full px-4 py-2 rounded-lg font-medium text-xs text-white transition-all ${
                    saving
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-sky-500"
                  }`}
                >
                  {saving ? "กำลังอัปเดต..." : "อัปเดตปี"}
                </button>
              </div>
            </div>

            {/* Delete Leave Balance by Year */}
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <FaExclamationTriangle className="text-red-600" />
                <h3 className="font-medium text-slate-900">ลบข้อมูลตามปี</h3>
              </div>
              <div className="space-y-3">
                <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">
                  <p className="font-medium text-red-700 mb-1">⚠️ คำเตือน:</p>
                  <ul className="space-y-1 text-red-600">
                    <li>• ลบข้อมูล LeaveBalance ทั้งหมดตามปี</li>
                    <li>• ไม่สามารถย้อนกลับได้</li>
                    <li>• ใช้เมื่อต้องการลบข้อมูลผิดพลาด</li>
                  </ul>
                </div>

                {/* Available Years Display */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-700 mb-2">📅 ปีที่มีในระบบ:</p>
                  {yearsLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>
                      <span className="text-xs text-slate-500">กำลังโหลด...</span>
                    </div>
                  ) : availableYears.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {availableYears.map((yearInfo) => (
                        <span
                          key={yearInfo.year}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
                        >
                          {yearInfo.year}
                          <span className="text-slate-400">({yearInfo.count})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">ไม่พบข้อมูลปีในระบบ</p>
                  )}
                </div>

                <input
                  type="number"
                  placeholder="ปีที่ต้องการลบ"
                  value={deleteYearInput}
                  onChange={(e) => setDeleteYearInput(e.target.value)}
                  className={`${inputBase} text-xs border-red-300 focus:ring-red-400`}
                  min="2000"
                  max="2100"
                />
                <button
                  onClick={handleDeleteLeaveBalanceByYear}
                  disabled={deleteLoading || !deleteYearInput}
                  className={`w-full px-4 py-2 rounded-lg font-medium text-xs text-white transition-all ${
                    deleteLoading || !deleteYearInput
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {deleteLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-flex h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      กำลังลบ...
                    </span>
                  ) : (
                    "ลบข้อมูลปีนั้น"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button with Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="text-amber-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">
                  รีเซ็ตยอดวันลาทั้งระบบ
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  การรีเซ็ตจะดำเนินการต่อไปนี้:
                </p>
                <ul className="text-sm text-slate-600 space-y-1 mb-4">
                  <li>• ลบและสร้างยอดวันลาหม่สำหรับทุกคน</li>
                  <li>• ทบยอดวันลาพักผ่อนที่เหลือจากปีก่อน (ถ้ามี)</li>
                  <li>• กำหนดยอดวันลาตามสิทธิ์ประจำตำแหน่ง</li>
                  <li>• รีเซ็ตข้อมูลสิทธิ์ประจำตำแหน่งทั้งหมด เพื่อจับคู่ใหม่เมื่ออายุงานเพิ่มขึ้น (บางประเภท)</li>
                </ul>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetLeaveBalance}
                    disabled={resetLoading}
                    className={`px-6 py-3 rounded-xl font-medium text-sm text-white transition-all shadow-sm ${
                      resetLoading
                        ? "bg-amber-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                    }`}
                  >
                    {resetLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        กำลังรีเซ็ต...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FaSync />
                        รีเซ็ตยอดวันหยุดทั้งระบบ
                      </span>
                    )}
                  </button>
                  <span className="text-xs text-amber-600 font-medium">
                    ⚠️ ไม่สามารถย้อนกลับได้
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
