import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { LogOut, ChevronDown } from "lucide-react";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout(); 
    navigate("/login", { replace: true }); 
    window.location.reload(); 
  };
  

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white font-kanit shadow-md">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl sm:text-2xl font-bold tracking-wide text-white">
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity duration-200 flex items-center gap-2"
          >
            ระบบลาคณะวิศวกรรมศาสตร์
          </Link>
        </div>

        {/* Profile Dropdown */}
        {user?.id && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition duration-200"
            >
              <span className="font-medium">สวัสดี, {user?.firstName || "ไม่มีชื่อ"}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">คณะ: {user.organization?.name}</p>
                  <p className="text-xs text-gray-500">สาขา: {user.department?.name}</p>
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
    </nav>
  );
}

export default Header;
