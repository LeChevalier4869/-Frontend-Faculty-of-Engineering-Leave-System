import { useEffect, useRef, useState } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import SplashScreen from "./components/SplashScreen";

function App() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (loading) return; // ยังตรวจสอบ auth อยู่ → คง splash ไว้

    // แสดง splash อย่างน้อย ~600ms เพื่อความลื่นไหล แล้ว fade ออกทันทีที่โหลดเสร็จ
    const elapsed = Date.now() - startRef.current;
    const wait = Math.max(0, 600 - elapsed);
    const t1 = setTimeout(() => setFadeOut(true), wait);
    const t2 = setTimeout(() => setShowSplash(false), wait + 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  if (showSplash) {
    return <SplashScreen fadeOut={fadeOut} />;
  }

  return <AppRouter />;
}

export default App;
