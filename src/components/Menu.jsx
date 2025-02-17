import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { HiOutlineChevronDown } from "react-icons/hi"; // ใช้ไอคอนสำหรับ dropdown

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
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const renderDropdown = (title, menu) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(title)}
        className="w-full flex justify-between items-center py-2 px-4 text-left bg-gray-300 font-bold text-gray-900 hover:bg-yellow-400 rounded-lg transition-all duration-200"
      >
        {title}
        <HiOutlineChevronDown
          className={`ml-2 transform ${
            openDropdown === title ? "rotate-180" : "rotate-0"
          } transition-transform duration-300`}
        />
      </button>
      {openDropdown === title && (
        <div className="bg-gray-300 mt-2 rounded-lg shadow-lg">
          {menu.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block py-2 px-4 font-bold text-gray-900 hover:bg-yellow-400 rounded-lg transition-all duration-200"
            >
              {item.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-64 bg-gray-200 text-gray-900 h-screen flex flex-col p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
        เมนูหลัก
      </h2>
      <nav className="flex flex-col space-y-4">
        {user?.role.includes("USER") &&
          userNav.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="py-2 px-4 bg-gray-300 rounded-lg font-bold text-gray-900 hover:bg-yellow-400 transition-all duration-200"
            >
              {item.text}
            </Link>
          ))}

        {(user?.role.includes("APPROVER_1") ||
          user?.role.includes("APPROVER_2") ||
          user?.role.includes("APPROVER_3") ||
          user?.role.includes("APPROVER_4")) && renderDropdown("เมนูผู้อนุมัติ", approverNav)}

        {user?.role.includes("ADMIN") && renderDropdown("เมนูผู้ดูแล", adminNav)}
      </nav>
    </div>
  );
};

export default Menu;
