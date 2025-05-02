import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiEndpoints } from "../../utils/api"; // 🔁 แก้ตามตำแหน่งจริงของไฟล์ api
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const { user ,setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmNewPassword) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านใหม่ไม่ตรงกัน",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ตกลง",
        backdrop: true,
        position: "center",
      });
      return;
    }

    try {
      await axios.post(apiEndpoints.changePassword, {
        email: user.email,
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "กรุณาเข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่ของคุณ",
        confirmButtonColor: "#ef4444",
        backdrop: true,
        position: "center",
      }).then(() => {
        setUser(null);
        navigate("/login");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonColor: "#ef4444",
        backdrop: true,
        position: "center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-kanit">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          เปลี่ยนรหัสผ่าน
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            บันทึกการเปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>
    </div>
  );
}
