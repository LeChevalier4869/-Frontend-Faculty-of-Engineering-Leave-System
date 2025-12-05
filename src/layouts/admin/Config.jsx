import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api";
import { FaCog } from "react-icons/fa";

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
  const [driveLink, setDriveLink] = useState("");
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
      setContacts({
        AdminName: map.AdminName || "",
        AdminPhone: map.AdminPhone || "",
        AdminMail: map.AdminMail || "",
      });
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
      if (res.data?.url) setDriveLink(res.data.url);
    } catch (err) {
      console.error("ไม่สามารถโหลดลิงก์ Google Drive:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchDriveLink();
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
      showAlert("success", "บันทึกลิงก์สำเร็จ", "", 1500);
    } catch (err) {
      console.error(err);
      showAlert("error", "เกิดข้อผิดพลาด", "ไม่สามารถบันทึกลิงก์ได้");
    } finally {
      setSaving(false);
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
              disabled={saving}
              className={`px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-150 shadow-sm ${
                saving
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
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
              disabled={saving}
              className={`px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-150 shadow-sm ${
                saving
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกลิงก์"}
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
      </div>
    </div>
  );
}
