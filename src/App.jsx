import { useEffect, useState } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import logo from "./assets/logo.png"; // โลโก้ใน src/assets/

function App() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      // เริ่ม fade-out หลัง splash แสดง 2 วินาที
      const timer1 = setTimeout(() => setFadeOut(true), 1500);
      // ซ่อน splash 1 วินาทีหลังเริ่ม fade-out
      const timer2 = setTimeout(() => setShowSplash(false), 3000);

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2);
      };
    }
  }, [loading]);

  if (showSplash) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-kanit
        ${fadeOut ? "animate-fade-out" : "animate-fade-in"}`}
      >
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mb-6 animate-bounce"
        />
        <p className="text-3xl font-semibold">กำลังโหลดระบบ...</p>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
