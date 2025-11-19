import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Header({ onMenuClick, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // console.log("Header user:", user);
  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative z-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white font-kanit shadow">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 relative">
        <span className="text-lg lg:text-2xl font-bold truncate whitespace-nowrap ml-64">
          ระบบลาคณะวิศวกรรมศาสตร์
        </span>

        {/* ✅ User Dropdown */}
        {user?.id && (
          <div className="relative ml-auto whitespace-nowrap" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition duration-200"
            >
              <span className="font-medium">
                สวัสดี, {user?.firstName || "ไม่มีชื่อ"}
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    คณะ: {user.department?.organization?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    สาขา: {user.department?.name}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
