import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);  // เริ่มเปิดไว้ก่อน
  const [isMiniSidebar, setMiniSidebar] = useState(false); // เริ่มแบบเต็ม

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleMiniSidebar = () => {
    setMiniSidebar(!isMiniSidebar);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMini={isMiniSidebar}
        toggleMiniSidebar={toggleMiniSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 bg-gray-100 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
