import { FiLogIn } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  "https://backend-faculty-of-engineering-leave.onrender.com";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

const handleContactClick = () => {
  Swal.fire({
    title: "ติดต่อเจ้าหน้าที่ระบบ",
    html: `
      <div style="text-align: left; line-height: 1.8;">
        <p><b> ชื่อผู้ดูแล:</b> นายทดสอบ ระบบ</p>
        <p><b> โทร:</b> 081-234-5678</p>
        <p><b> อีเมล:</b> support@example.com</p>
        <p><b> LINE ID:</b> @engineer-support</p>
      </div>
    `,
    icon: "info",
    confirmButtonText: "ปิด",
    confirmButtonColor: "#d33",
    width: 400,
    background: "#1f2937", // bg-gray-800
    color: "#fff",
    customClass: {
      popup: "font-kanit", // ✅ ใช้ฟอนต์ Kanit
      title: "font-kanit text-lg",
      confirmButton: "font-kanit",
    },
  });
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4 font-kanit">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow">
        ระบบลา <span className="text-red-500">คณะวิศวกรรมศาสตร์</span>
      </h1>

      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex justify-center mb-4">
          <FiLogIn className="text-white text-5xl" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-white mb-6">
          เข้าสู่ระบบ
        </h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition duration-300 font-medium flex justify-center items-center gap-2"
        >
          <FaGoogle />
          {isLoading ? "กำลังนำไปยัง Google..." : "เข้าสู่ระบบด้วย Google"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ต้องการความช่วยเหลือ?{" "}
            <button
              onClick={handleContactClick}
              className="text-red-400 hover:underline"
            >
              ติดต่อเจ้าหน้าที่ระบบ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
