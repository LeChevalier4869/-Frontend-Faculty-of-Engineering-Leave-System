import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    if (accessToken && refreshToken) {
      // เก็บ token ลง localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // redirect ไป dashboard
      navigate("/dashboard");
    } else {
      // ถ้าไม่มี token → กลับไป login
      navigate("/login");
    }
  }, [navigate]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
