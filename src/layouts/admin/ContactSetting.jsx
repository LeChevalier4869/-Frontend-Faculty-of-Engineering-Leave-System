import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints, BASE_URL } from "../../utils/api";
import { FaCog } from "react-icons/fa";

export default function AdminContactSetting() {
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

  const [contacts, setContacts] = useState({
    AdminName: "",
    AdminPhone: "",
    AdminMail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/contact`);
      // ต้องใช้อันนี้ ----------------> const res = await axios.get(`${apiEndpoints.getContact}`);
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
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text: "ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSave = async (key) => {
    try {
      setSaving(true);
      const value = contacts[key];
      await axios.put(
        `http://localhost:8000/api/contact/${key}`,
        { value },
        authHeader()
      );
      // ต้องใช้อันนี้ ----------------> await axios.put(`${BASE_URL}/api/contact/${key}`, { value }, authHeader());
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: `${key} ถูกอัปเดตแล้ว`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-700 font-kanit text-xl">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-center">
          <FaCog className="mr-3 text-4xl text-gray-800" />
          <h1 className="text-center text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl">
            ตั้งค่าข้อมูลติดต่อเจ้าหน้าที่ระบบ
          </h1>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl bg-gray-50 p-6 shadow sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              { label: "ชื่อเจ้าหน้าที่", key: "AdminName", type: "text" },
              { label: "เบอร์โทรศัพท์", key: "AdminPhone", type: "text" },
              { label: "อีเมล", key: "AdminMail", type: "email" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={contacts[field.key]}
                  onChange={(e) =>
                    setContacts({ ...contacts, [field.key]: e.target.value })
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder={`กรอก${field.label}`}
                />
                <button
                  onClick={() => handleSave(field.key)}
                  disabled={saving}
                  className={`mt-3 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
                  }`}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
