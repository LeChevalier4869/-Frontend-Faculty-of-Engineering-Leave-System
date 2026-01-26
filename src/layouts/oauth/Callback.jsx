import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import getApiUrl from "../../utils/apiUtils";
import Swal from "sweetalert2";

export default function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");
    const error = urlParams.get("error");

    // ถ้ามี error จาก backend ให้แสดง Swal.fire ทันที
    if (error) {
      const errorMessage = decodeURIComponent(error);
      
      Swal.fire({
        icon: "warning",
        title: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        text: errorMessage,
        confirmButtonText: "กลับหน้าเข้าสู่ระบบ",
        confirmButtonColor: "#ef4444"
      }).then(() => {
        navigate("/login");
      });
      return;
    }

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
          navigate("/dashboard");
        } catch (err) {
          console.error("fetch user error:", err);
          
          // ตรวจสอบว่าเป็น error จากการไม่พบบัญชีหรือไม่
          const errorMessage = err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
          
          if (errorMessage.includes("ไม่พบข้อมูลบัญชีของคุณในระบบ")) {
            await Swal.fire({
              icon: "warning",
              title: "ไม่พบบัญชีผู้ใช้",
              text: "บัญชี Google ของคุณไม่ได้ลงทะเบียนในระบบ กรุณาติดต่อเจ้าหน้าที่เพื่อสร้างบัญชี",
              confirmButtonText: "ติดต่อเจ้าหน้าที่",
              confirmButtonColor: "#ef4444",
              showCancelButton: true,
              cancelButtonText: "กลับหน้าเข้าสู่ระบบ",
              cancelButtonColor: "#6b7280"
            }).then((result) => {
              if (result.isConfirmed) {
                // ส่งไปหน้าติดต่อเจ้าหน้าที่
                window.location.href = "mailto:support@rmuti.ac.th?subject=ขอสร้างบัญชีระบบลา&body=กรุณาสร้างบัญชีสำหรับอีเมล: " + (err?.response?.data?.email || "");
              } else {
                navigate("/login");
              }
            });
          } else {
            await Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: errorMessage,
              confirmButtonText: "กลับหน้าเข้าสู่ระบบ",
              confirmButtonColor: "#ef4444"
            });
            navigate("/login");
          }
        }
      };

      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate, setUser]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
