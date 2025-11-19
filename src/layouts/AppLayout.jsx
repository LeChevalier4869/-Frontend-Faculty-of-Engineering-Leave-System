import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import clsx from "clsx";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMiniSidebar, setMiniSidebar] = useState(false);

    const toggleSidebar = () => setSidebarOpen((v) => !v);
    const toggleMiniSidebar = () => setMiniSidebar((v) => !v);

    const mainShift = clsx(
        "transition-all duration-300",
        isMiniSidebar ? "ml-16" : "ml-64"
    );

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
                <main className={clsx("flex-1 overflow-auto p-4 bg-gray-100", mainShift)}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}