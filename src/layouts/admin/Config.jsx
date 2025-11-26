import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints, BASE_URL } from "../../utils/api";
import { FaCog } from "react-icons/fa";

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl overflow-hidden bg-slate-900/60 border border-sky-500/15 shadow-[0_22px_60px_rgba(8,47,73,0.85)] backdrop-blur-xl ${className}`}
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
    "px-4 py-2 rounded-xl border bg-slate-900/70 text-slate-100 text-sm shadow-[0_18px_45px_rgba(8,47,73,0.6)] focus:outline-none focus:ring-2 focus:ring-sky-400/70 placeholder:text-slate-500";

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] font-kanit text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-[0_22px_60px_rgba(8,47,73,0.9)] backdrop-blur-2xl p-6">
          <div className="flex flex-col items-center gap-3 text-sm">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400/40 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
            </div>
            <span className="font-medium">กำลังโหลดหน้าตั้งค่าระบบ...</span>
            <span className="text-xs text-slate-400">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจากเซิร์ฟเวอร์
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071429] via-[#050f23] to-[#040b1c] px-4 py-8 md:px-8 font-kanit text-slate-100 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-100">
              System Configuration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-400/40">
              <FaCog className="text-2xl text-sky-300" />
            </div>
            <h1 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
              ตั้งค่าระบบ
            </h1>
          </div>
          <p className="text-sm text-slate-300 text-center">
            จัดการข้อมูลติดต่อเจ้าหน้าที่และลิงก์ดาวน์โหลดเอกสารต่าง ๆ ของระบบ
          </p>
        </div>

        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-6">
            ข้อมูลติดต่อเจ้าหน้าที่
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { label: "ชื่อเจ้าหน้าที่", key: "AdminName", type: "text" },
              { label: "เบอร์โทรศัพท์", key: "AdminPhone", type: "text" },
              { label: "อีเมล", key: "AdminMail", type: "email" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-[0.15em]">
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
                      ? "border-rose-400/70"
                      : "border-sky-500/30"
                  }`}
                  placeholder={`กรอก${field.label}`}
                  required
                />
                {!contacts[field.key]?.trim() && (
                  <span className="text-rose-400 text-xs mt-1">
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
              className={`px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-200 shadow-[0_16px_40px_rgba(8,47,73,0.9)] ${
                saving
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลเจ้าหน้าที่"}
            </button>
          </div>
        </Panel>

        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-6">
            ลิงก์ดาวน์โหลดใบลา (Google Drive)
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <input
              type="text"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="วางลิงก์ Google Drive ที่นี่"
              className={`${inputBase} border-sky-500/30 flex-1`}
            />

            <button
              onClick={() => driveLink && window.open(driveLink, "_blank")}
              className="mt-3 md:mt-0 px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-200 bg-sky-600 hover:bg-sky-500 active:scale-[0.98] shadow-[0_14px_36px_rgba(8,47,73,0.9)]"
            >
              เปิดลิงก์
            </button>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveDriveLink}
              disabled={saving}
              className={`px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-200 shadow-[0_16px_40px_rgba(8,47,73,0.9)] ${
                saving
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกลิงก์"}
            </button>
          </div>
        </Panel>

        <Panel className="p-6 sm:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-4">
            ตั้งค่าอื่น ๆ (เช่น ฟอร์ม, รายงาน)
          </h2>
          <p className="text-sm text-slate-400 italic">
            ยังไม่มีข้อมูลในส่วนนี้ คุณสามารถเพิ่มฟอร์ม ปุ่ม หรือการตั้งค่าอื่น ๆ
            เพิ่มเติมได้ภายหลัง
          </p>
        </Panel>
      </div>
    </div>
  );
}
