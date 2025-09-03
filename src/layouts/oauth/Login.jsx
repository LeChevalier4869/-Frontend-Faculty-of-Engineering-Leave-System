import React from "react";
import API, { setTokens } from "../../utils/axios";

function Login() {
  const handleGoogleLogin = () => {
    // Redirect ไป backend OAuth (เปิด popup ได้)
    window.location.href = "https://backend-faculty-of-engineering-leave.onrender.com/auth/google";
  };

  // ถ้า backend redirect กลับมาพร้อม jwtAccess/jwtRefresh
  // คุณอาจจะต้องมีหน้า callback เช่น /auth/callback ที่ backend ส่ง token มา
  // แล้ว frontend เก็บเข้า localStorage แล้ว setTokens()

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Login Page</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleGoogleLogin}
      >
        Login with Google
      </button>
    </div>
  );
}

export default Login;
