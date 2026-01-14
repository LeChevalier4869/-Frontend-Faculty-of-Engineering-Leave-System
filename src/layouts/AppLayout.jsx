import bg from "../assets/bg.jpg";
import { useState } from "react";
import clsx from "clsx";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMiniSidebar, setMiniSidebar] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleMiniSidebar = () => setMiniSidebar(!isMiniSidebar);

  const mainShift = clsx("transition-all duration-300", isMiniSidebar ? "ml-16" : "ml-64");

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
          isMini={isMiniSidebar}
          toggleMiniSidebar={toggleMiniSidebar}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />
          <main className={clsx("flex-1 overflow-auto p-4", mainShift)}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
