// Callback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import AuditLogService from "../../services/auditLogService";

export default function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    // if (accessToken && refreshToken) {
    if (accessToken) {
      // เก็บ token
      localStorage.setItem("accessToken", accessToken);
      // localStorage.setItem("refreshToken", refreshToken);

      // ดึงข้อมูล user แล้วเซฟเข้า context เลย
      const fetchUser = async () => {
        try {
          const url = getApiUrl("auth/me");
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          });
          const returned = res.data.data ?? res.data.user ?? res.data;
          setUser(returned);
          
          // บันทึก audit log สำหรับการ login
          try {
            await AuditLogService.logUserAction({
              userId: returned.id,
              action: "Login",
              details: `ผู้ใช้ ${returned.firstName} ${returned.lastName} เข้าสู่ระบบผ่าน Google OAuth`
            });
          } catch (logError) {
            console.warn('Failed to log login action:', logError);
          }
          
          navigate("/dashboard");
        } catch (err) {
          console.error("fetch user error:", err);
          navigate("/login");
        }
      };

      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate, setUser]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
