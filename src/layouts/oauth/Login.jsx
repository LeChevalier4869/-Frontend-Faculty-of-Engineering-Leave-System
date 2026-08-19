import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import Swal from "../../utils/alert";
import axios from "axios";
import { apiEndpoints, BASE_URL } from "../../utils/api";
import bg from "../../assets/bg.jpg";
import engLogo from "../../assets/logo.png";

const BACKEND_URL = BASE_URL;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  // เมื่อผู้ใช้กด back จากหน้าเลือกบัญชี Google เบราว์เซอร์จะคืนหน้านี้จาก bfcache
  // ทำให้ state isLoading=true ค้างมาด้วย (ปุ่มกดไม่ได้) จึงรีเซ็ตทุกครั้งที่หน้าถูกแสดง
  useEffect(() => {
    const resetLoading = () => setIsLoading(false);
    window.addEventListener("pageshow", resetLoading);
    return () => window.removeEventListener("pageshow", resetLoading);
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleContactClick = async () => {
    try {
      const res = await axios.get(`${apiEndpoints.getContact}`);
      const data = res.data;

      const contactMap = {};
      data.forEach((item) => {
        contactMap[item.key] = item.value;
      });

      Swal.fire({
        title: "ติดต่อเจ้าหน้าที่ระบบ",
        html: `
          <div style="text-align: left; line-height: 1.8; font-size: 20px;">
            <p><i class="fas fa-user ml-9 mr-2 text-red-400"></i>${contactMap.AdminName || "-"}</p>
            <p><i class="fas fa-phone ml-9 mr-2 text-green-400"></i>${contactMap.AdminPhone || "-"}</p>
            <p><i class="fas fa-envelope ml-9 mr-2 text-blue-400"></i>${contactMap.AdminMail || "-"}</p>
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
    <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden font-kanit">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${bg})` }}
      />
      {/* ม่านสีเลือดหมูทับพื้นหลังให้เข้าธีมคณะ */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-brand-900/55 backdrop-blur-[2px]" />

      <div className="relative z-10 px-4 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow-lg">
          ระบบจัดการวันลา{" "}
          <span className="text-gold">คณะวิศวกรรมศาสตร์</span>
        </h1>

        <div className="mx-auto bg-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/15 backdrop-blur-xl">
          {/* แถบทองด้านบนการ์ด */}
          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-gold" />

          <div className="flex justify-center mb-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <img
                src={engLogo}
                alt="Engineering Faculty Logo"
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-center text-white mb-1">
            เข้าสู่ระบบ
          </h2>
          <p className="text-center text-white/60 text-sm mb-6">
            ใช้บัญชี Google ของมหาวิทยาลัย
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed text-slate-800 py-2.5 rounded-xl transition duration-300 font-medium flex justify-center items-center gap-2 shadow-lg"
          >
            <FaGoogle className="text-[#EA4335]" />
            {isLoading ? "กำลังนำไปยัง Google..." : "เข้าสู่ระบบด้วย Google"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              ต้องการความช่วยเหลือ?{" "}
              <button
                onClick={handleContactClick}
                className="text-gold hover:underline font-medium"
              >
                ติดต่อเจ้าหน้าที่ระบบ
              </button>
            </p>
            <p className="mt-2 text-white/70 text-sm">
              <a
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold hover:underline font-medium"
              >
                📖 คู่มือการใช้งาน / การติดตั้งระบบ
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-white/50 text-xs">
          © คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น
        </p>
      </div>
    </div>
  );
}
