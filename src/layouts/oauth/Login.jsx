import { FiLogIn } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  "https://backend-faculty-of-engineering-leave.onrender.com";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleContactClick = async () => {
    try {
      // const res = await axios.get(`http://localhost:8000/api/contact`);
      const res = await axios.get(`${apiEndpoints.getContact}`);
      const data = res.data;

      // แปลงข้อมูลให้อยู่ในรูปแบบ key:value
      const contactMap = {};
      data.forEach((item) => {
        contactMap[item.key] = item.value;
      });

      Swal.fire({
        title: "ติดต่อเจ้าหน้าที่ระบบ",
        html: `
        <div style="text-align: left; line-height: 1.8; font-size: 20px;">
          <p><i class="fas fa-user ml-9 mr-2 text-red-400"></i>${
            contactMap.AdminName || "-"
          }</p>
          <p><i class="fas fa-phone ml-9 mr-2 text-green-400"></i>${
            contactMap.AdminPhone || "-"
          }</p>
          <p><i class="fas fa-envelope ml-9 mr-2 text-blue-400"></i>${
            contactMap.AdminMail || "-"
          }</p>
        </div>
      `,
        icon: "info",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#d33",
        width: 380,
        background: "#1f2937",
        color: "#fff",
        customClass: {
          popup: "font-kanit rounded-2xl",
          title: "font-kanit text-3xl",
          confirmButton: "font-kanit",
        },
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลติดต่อได้",
        confirmButtonText: "ตกลง",
      });
    }
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
