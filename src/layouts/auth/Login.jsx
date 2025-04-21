import axios from "axios";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { apiEndpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import Swal from "sweetalert2"; 

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [input, setInput] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(apiEndpoints.login, input);
      const token = res.data.token;
      localStorage.setItem("token", token);

      const userRes = await axios.get(apiEndpoints.getMe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "ยินดีต้อนรับ!",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ไปยังหน้าหลัก",
      }).then(() => {
        window.location.href = "/dashboard"; 
      });
      
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ตกลง",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-white to-rose-200 px-4 font-kanit">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 drop-shadow">
        <span className="text-black">ระบบลา</span>
        <span className="text-red-600">คณะวิศวกรรมศาสตร์</span>
      </h1>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <FiLogIn className="text-red-500 text-5xl" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-6">
          เข้าสู่ระบบ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-medium mb-1">อีเมล</label>
            <input
              type="email"
              name="email"
              value={input.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={input.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 font-medium flex justify-center items-center gap-2"
          >
            <FiLogIn className="text-lg" />
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ยังไม่มีบัญชี?{" "}
            <button
              className="text-red-600 font-medium cursor-pointer hover:underline disabled:opacity-50"
              disabled={isLoading}
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  navigate("/register");
                }, 1500);
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaCog className="animate-spin h-4 w-4 text-red-600" />
                  กำลังโหลด...
                </span>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
