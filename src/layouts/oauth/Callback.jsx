import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";


export default function Callback() {
  const navigate = useNavigate();
  const { user ,setUser } = useAuth();

  const token = user?.token;
  localStorage.setItem("token", token);

  const fetchUser = async () => {
    try {
      const res = await axios.get(apiEndpoints.getMe, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data;
      setUser(user);
    } catch (err) {
      console.error("fetchUser error:", err);
    }
  };
  fetchUser();

  // ตรวจสอบ roles ในรูปแบบที่ถูกต้อง
  // const roles = (user?.roles || []).map((role) => role.roleName);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    if (accessToken && refreshToken) {
      // เก็บ token ลง localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("Access:", accessToken);
      console.log("Refresh:", refreshToken);

      // redirect ไป dashboard
      navigate("/dashboard");
    } else {
      // ถ้าไม่มี token → กลับไป login
      navigate("/login");
    }
  }, [navigate]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
