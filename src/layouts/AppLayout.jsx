import bg from "../assets/bg.jpg";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      // Auto-close sidebar on mobile
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const mainShift = isMobile ? "" : "ml-64";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1.5px]" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header 
            onMenuClick={toggleSidebar} 
            isMobile={isMobile}
          />
          <main className={clsx("flex-1 overflow-auto p-4", mainShift)}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
