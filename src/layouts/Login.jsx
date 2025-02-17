import axios from "axios";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { apiEndpoints } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [input, setInput] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(apiEndpoints.login, input);
      const token = res.data.token;
      
      console.log("Token received:", token);
      localStorage.setItem("token", token);
      
      const userRes = await axios.get(apiEndpoints.getMe, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("User data:", userRes.data);
      setUser(userRes.data);
    } catch (err) {
      console.error("Login error:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <h1 className="text-6xl font-bold text-white mb-12">ระบบลาคณะวิศกรรมศาสตร์</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium">อีเมล:</label>
            <input
              type="email"
              name="email"
              value={input.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 font-medium">รหัสผ่าน:</label>
            <input
              type="password"
              name="password"
              value={input.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">ยังไม่มีบัญชี? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/register")}>สมัครสมาชิก</span></p>
        </div>
      </div>
    </div>
  );
}
