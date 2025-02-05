import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const userNav = [
  { to: "/dashboard", text: "แดชบอร์ด" },
  { to: "/leave/add", text: "ยื่นลา" },
  { to: "/leave", text: "การลา" },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้" },
];

const approverNav = [
  { to: "/approve", text: "การลาที่รอการอนุมัติ" },
  { to: "/user/landing", text: "บุคลากร" },
];

const adminNav = [
  { to: "/admin", text: "จัดการผู้ใช้งาน" },
  { to: "/settings", text: "การตั้งค่า" },
];

const Menu = () => {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const renderDropdown = (title, menu) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(title)}
        className="w-full flex justify-between items-center py-2 px-4 text-left font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
      >
        {title}
        <span
          className={`ml-2 transform ${
            openDropdown === title ? "rotate-180" : "rotate-0"
          } transition`}
        >
          ▼
        </span>
      </button>
      {openDropdown === title && (
        <div className="bg-blue-700 mt-2 rounded-lg shadow-lg">
          {menu.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block py-2 px-4 text-white hover:bg-blue-800 rounded-lg transition"
            >
              {item.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-64 bg-blue-600 text-white h-screen flex flex-col p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">เมนูหลัก</h2>
      <nav className="flex flex-col space-y-4">
        {/* User Role Handling */}
        {user?.role === "USER" && (
          <>
            {userNav.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className="py-2 px-4 bg-blue-500 rounded-lg text-white hover:bg-blue-700 transition"
              >
                {item.text}
              </Link>
            ))}
          </>
        )}
        {user?.role === "APPROVER" && (
          <>
            {renderDropdown("เมนูผู้ใช้ทั่วไป", userNav)}
            {renderDropdown("เมนูผู้อนุมัติ", approverNav)}
          </>
        )}
        {user?.role === "ADMIN" && (
          <>
            {renderDropdown("เมนูผู้ใช้ทั่วไป", userNav)}
            {renderDropdown("เมนูผู้ดูแล", adminNav)}
          </>
        )}
      </nav>
    </div>
  );
};

export default Menu;
