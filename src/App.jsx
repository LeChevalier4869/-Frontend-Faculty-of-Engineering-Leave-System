import { useEffect, useState } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import logo from "./assets/logo.png";

function App() {
  const { loading } = useAuth();

  const [showSplash, setShowSplash] = useState(() => {
    // ✅ ถ้ามี token แล้ว (login แล้ว) → ไม่ต้องโชว์ Splash
    const token = localStorage.getItem("accessToken");
    return !token; // true = ยังไม่มี token (เข้าเว็บครั้งแรก)
  });

  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading && showSplash) {
      // ✅ ถ้าไม่มี token → แสดง Splash แล้วค่อยซ่อน
      const timer1 = setTimeout(() => setFadeOut(true), 1500);
      const timer2 = setTimeout(() => setShowSplash(false), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loading, showSplash]);

  // ✅ ถ้ามี token แล้วจะไม่เข้าบล็อกนี้เลย
  if (showSplash) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-kanit
        ${fadeOut ? "animate-fade-out" : "animate-fade-in"}`}
      >
        <img src={logo} alt="Logo" className="w-24 h-24 mb-6 animate-bounce" />
        <p className="text-3xl font-semibold">กำลังโหลดระบบ...</p>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
