// import React from "react";
// import API, { setTokens } from "../../utils/axios";

// function Login() {
//   const handleGoogleLogin = () => {
//     // Redirect ไป backend OAuth (เปิด popup ได้)
//     window.location.href = "https://backend-faculty-of-engineering-leave.onrender.com/auth/google";
//   };

//   // ถ้า backend redirect กลับมาพร้อม jwtAccess/jwtRefresh
//   // คุณอาจจะต้องมีหน้า callback เช่น /auth/callback ที่ backend ส่ง token มา
//   // แล้ว frontend เก็บเข้า localStorage แล้ว setTokens()

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold">Login Page</h1>
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
//         onClick={handleGoogleLogin}
//       >
//         Login with Google
//       </button>
//     </div>
//   );
// }

// export default Login;

//============================
//new code
//============================

// src/pages/auth/Login.jsx
import { FiLogIn } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  "https://backend-faculty-of-engineering-leave.onrender.com";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/google`;
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

        {/* (ตัวเลือก) ลิงก์สมัคร / ลืมรหัสผ่าน เก็บไว้เผื่อโหมด manual ในอนาคต */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ต้องการความช่วยเหลือ?{" "}
            <span className="text-red-400">ติดต่อเจ้าหน้าที่ระบบ</span>
          </p>
        </div>
      </div>
    </div>
  );
}
