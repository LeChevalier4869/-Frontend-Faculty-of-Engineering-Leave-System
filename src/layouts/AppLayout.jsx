import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMini, setIsSidebarMini] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const handler = (e) => {
      setIsMobile(e.matches);
      setIsSidebarOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleMiniSidebar = () => setIsSidebarMini((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        isMini={isSidebarMini}
        toggleMiniSidebar={toggleMiniSidebar}
        isMobile={isMobile}
        onClose={closeSidebar}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
       <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gray-100 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
