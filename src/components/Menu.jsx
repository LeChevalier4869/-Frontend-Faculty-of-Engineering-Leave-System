import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  HiOutlineChevronDown,
  HiMenu,
} from "react-icons/hi";

const userNav = [
  { to: "/dashboard", text: "แดชบอร์ด" },
  { to: "/leave/add", text: "ยื่นลา" },
  { to: "/leave", text: "การลา" },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้" },
];

const approverNav = [
  { to: "/admin/leave-request", text: "การลาที่รอการอนุมัติ" },
  { to: "/user/landing", text: "บุคลากร" },
];

const adminNav = [
  { to: "/",                        text: "เมนูแอดมิน"},
  { to: "/admin/manage-user",       text: "จัดการผู้ใช้งาน" },
  { to: "/admin/department-manage", text: "จัดการแผนก" },
  { to: "/admin/edit-profile",      text: "การตั้งค่า" },
];

const Menu = () => {
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const renderDropdown = (title, menu) => (
    <div className="relative group">
      <button
        onClick={() => toggleDropdown(title)}
        className="w-full flex justify-between items-center py-2 px-4 bg-gray-600 text-white font-semibold hover:bg-gray-500 rounded-lg transition-all duration-200 font-kanit"
      >
        <span>{title}</span>
        <HiOutlineChevronDown
          className={`ml-auto transform ${openDropdown === title ? "rotate-180" : "rotate-0"
            } transition-transform duration-300`}
        />
      </button>

      {openDropdown === title && (
        <div className="bg-gray-700 mt-2 rounded-lg shadow-lg">
          {menu.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block py-2 px-4 text-white hover:bg-gray-600 rounded-lg transition-all duration-200 font-kanit"
            >
              {item.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 📱 Mobile Topbar */}
      <div className="md:hidden p-4 bg-gray-800 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold font-kanit">ระบบลาคณะวิศวกรรมศาสตร์</h2>
        <button
          onClick={toggleSidebar}
          className="flex flex-col justify-center items-center w-8 h-8 space-y-1"
        >
          <span className="block w-6 h-0.5 bg-white rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
        </button>
      </div>

      {/* 🖥️ Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 text-white font-kanit transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="p-4 pt-6">
          <h2 className="text-2xl font-bold mb-6 text-center font-kanit hidden md:block">
            เมนูหลัก
          </h2>

          <nav className="flex flex-col space-y-4 mt-6">
            {/* USER */}
            {user?.role.includes("USER") &&
              userNav.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500 transition-all duration-200 font-kanit"
                >
                  {item.text}
                </Link>
              ))}

            {/* APPROVER */}
            {(user?.role.includes("APPROVER_1") ||
              user?.role.includes("APPROVER_2") ||
              user?.role.includes("APPROVER_3") ||
              user?.role.includes("APPROVER_4")) &&
              renderDropdown("เมนูผู้อนุมัติ", approverNav)}

            {/* ADMIN */}
            {user?.role.includes("ADMIN") &&
              renderDropdown("เมนูผู้ดูแล", adminNav)
            }
          </nav>
        </div>
      </div>
    </>
  );
};

export default Menu;
