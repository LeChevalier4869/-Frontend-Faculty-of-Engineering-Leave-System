import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { LogOut, ChevronDown } from "lucide-react"; // ไอคอน Logout และ ลูกศร

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const hdlLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-semibold tracking-wide">
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity duration-200 flex items-center space-x-2"
          >
            <span>ระบบวันลาคณะวิศวกรรมศาสตร์</span>
          </Link>
        </div>

        {/* Profile Dropdown */}
        {user?.id && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200"
            >
              <span className="font-medium">สวัสดี, {user?.firstName || "ไม่มีชื่อ"}</span>
              <ChevronDown
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b">
                  <p className="text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">คณะ: {user.organization?.name}</p>
                  <p className="text-xs text-gray-500">สาขา: {user.department?.name}</p>
                </div>
                <button
                  onClick={hdlLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 transform transition-transform duration-300 hover:scale-110" />
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
