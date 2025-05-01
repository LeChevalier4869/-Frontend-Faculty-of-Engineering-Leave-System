import { useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import { FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(apiEndpoints.forgotPassword, { email });

      Swal.fire({
        icon: "success",
        title: "ส่งคำขอลืมรหัสผ่านแล้ว",
        text: "โปรดตรวจสอบอีเมลของคุณ",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ตกลง",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถส่งคำขอได้",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4 font-kanit">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow">
        ลืมรหัสผ่าน <span className="text-red-500">ระบบลา</span>
      </h1>

      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex justify-center mb-4">
          <FiMail className="text-white text-5xl" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-white mb-6">
          กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-1">อีเมล</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 font-medium flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 animate-pulse">
                <FiMail className="text-lg" />
                กำลังส่ง...
              </span>
            ) : (
              <>
                <FiMail className="text-lg" />
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            className="text-gray-300 hover:underline text-sm"
            onClick={() => navigate("/login")}
          >
            ย้อนกลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
