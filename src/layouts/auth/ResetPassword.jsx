import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบค่า token จาก URL
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");

    // ถ้าไม่มี token ใน URL, ทำการ redirect ไปที่หน้า login หรือแสดงข้อความ
    if (!tokenFromUrl) {
      Swal.fire({
        icon: "error",
        title: "ไม่พบลิงก์รีเซ็ตรหัสผ่าน",
        text: "กรุณาตรวจสอบลิงก์ที่คุณได้รับ",
        confirmButtonColor: "#ef4444",
      }).then(() => navigate("/login"));
      return;
    }

    setToken(tokenFromUrl);  // ถ้ามี token ก็เก็บไว้ใน state
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // ตรวจสอบการยืนยันรหัสผ่าน
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านให้ตรงกัน",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(apiEndpoints.resetPassword, {
        token,
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "รีเซ็ตรหัสผ่านสำเร็จ!",
        text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        window.location.href = "/login";  // หรือ redirect ไปที่หน้า login
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // ถ้าไม่มี token ใน URL, ไม่ให้แสดงฟอร์มรีเซ็ตรหัสผ่าน
  if (!token) {
    return <div>ไม่พบลิงก์รีเซ็ตรหัสผ่าน</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4 font-kanit">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow">
        ระบบรีเซ็ตรหัสผ่าน
      </h1>

      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-white mb-6">
          กำหนดรหัสผ่านใหม่
        </h2>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 font-medium"
          >
            {loading ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
