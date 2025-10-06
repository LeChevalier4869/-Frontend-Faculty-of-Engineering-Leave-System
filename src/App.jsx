import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import logo from "./assets/logo.png";

function App() {
  const { loading } = useAuth();
  const location = useLocation(); // ✅ ใช้ตรวจเส้นทางปัจจุบัน

  const [showSplash, setShowSplash] = useState(() => {
    const hasShown = localStorage.getItem("hasShownSplash");
    return !hasShown;
  });
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // ✅ ถ้าอยู่หน้า login → ไม่ต้องแสดง Splash
    if (location.pathname === "/login") {
      setShowSplash(false);
      return;
    }

    if (!loading && showSplash) {
      localStorage.setItem("hasShownSplash", "true");

      const timer1 = setTimeout(() => setFadeOut(true), 1500);
      const timer2 = setTimeout(() => setShowSplash(false), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loading, showSplash, location.pathname]);

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
