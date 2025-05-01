import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import clsx from "clsx";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout() {
  /* --- state --- */
  const [isExpanded, setExpanded] = useState(false); // ขยาย/ย่อ (ทุกขนาดจอ)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 1024);

  /* --- breakpoint listener --- */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* --- handlers --- */
  const toggleSidebar = () => setExpanded((o) => !o);
  const closeSidebar  = useCallback(() => setExpanded(false), []);

  /* --- main shift --- */
  const mainShift = clsx(
    "transition-all duration-300",
    isExpanded ? "ml-64" : "ml-16"   // 64 px vs 256 px
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isExpanded={isExpanded}
        isMobile={isMobile}
        onClose={closeSidebar}
      />

      <div className={clsx("flex flex-col flex-1 overflow-hidden", mainShift)}>
        <Header
          onToggleSidebar={toggleSidebar}
          isExpanded={isExpanded}
        />

        <main className="flex-1 overflow-auto bg-gray-100 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
