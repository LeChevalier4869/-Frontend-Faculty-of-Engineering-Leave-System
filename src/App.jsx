import { useEffect, useState } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import logo from "./assets/logo.png";

function App() {
  const { loading } = useAuth();
  
  // ✅ เริ่มต้น: ถ้ามี token → ไม่ต้องโชว์ Splash
  const [showSplash, setShowSplash] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return !token; // true = ยังไม่มี token → แสดง Splash
  });
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading && showSplash) {
      // ✅ ตั้ง timer fade out
      const timer1 = setTimeout(() => setFadeOut(true), 1500);
      const timer2 = setTimeout(() => setShowSplash(false), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loading, showSplash]);

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
