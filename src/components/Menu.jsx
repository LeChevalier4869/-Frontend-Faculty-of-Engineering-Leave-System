import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaPlusCircle,
  FaClipboardList,
  FaUser,
  FaCheckCircle,
  FaUsersCog,
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const userNav = [
  { to: "/dashboard", text: "แดชบอร์ด", icon: <FaTachometerAlt /> },
  { to: "/leave/balance", text: "ยอดวันลาคงเหลือ", icon: <FaClipboardList /> },
  { to: "/leave/add", text: "ยื่นลา", icon: <FaPlusCircle /> },
  { to: "/leave", text: "การลา", icon: <FaCalendarAlt /> },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้", icon: <FaUser /> },
];

const approverNav1 = [{ to: "/approver/leave-request-approver1", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];
const verifierNav = [{ to: "/approver/leave-request-verifier", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];
const receiverNav = [{ to: "/approver/leave-request-receiver", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];
const approverNav2 = [{ to: "/approver/leave-request-approver2", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];
const approverNav3 = [{ to: "/approver/leave-request-approver3", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];
const approverNav4 = [{ to: "/approver/leave-request-approver4", text: "การลาที่รอการอนุมัติ", icon: <FaCheckCircle /> }];

const adminNav = [
  { to: "/", text: "เมนูแอดมิน", icon: <FaUsersCog /> },
  { to: "/admin/manage-user", text: "จัดการผู้ใช้งาน", icon: <FaUsersCog /> },
  { to: "/admin/department-manage", text: "จัดการแผนก", icon: <FaUsersCog /> },
  { to: "/admin/edit-profile", text: "การตั้งค่า", icon: <FaUsersCog /> },
];

function Sidebar({ isOpen, isMini, toggleMiniSidebar }) {
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (title) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  const renderDropdown = (title, menu) => (
    <div className="flex flex-col">
      <button
        onClick={() => toggleDropdown(title)}
        className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 font-kanit w-full"
      >
        <div className="flex items-center gap-3">
          {menu[0]?.icon}
          {!isMini && <span>{title}</span>}
        </div>
        {!isMini && (
          <HiOutlineChevronDown
            className={`w-5 h-5 ml-auto transition-transform duration-300 ${
              openDropdown === title ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </button>
      {openDropdown === title && (
        <div className={`flex flex-col ${isMini ? "pl-2" : "ml-4"} mt-1`}>
          {menu.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="flex items-center gap-3 py-2 px-4 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded font-kanit"
            >
              {item.icon}
              {!isMini && item.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside
      className={`fixed md:static top-0 left-0 z-40 bg-gray-900 text-white font-kanit transform transition-all duration-300 ease-in-out
        ${isMini ? "w-16" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        h-full
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
        <span className="text-xl md:text-2xl font-bold truncate">
          {!isMini && "ระบบลาคณะวิศวกรรมศาสตร์"}
        </span>
        <button
          onClick={toggleMiniSidebar}
          className="p-1 rounded hover:bg-gray-700 transition md:hidden"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMini ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {user?.role.includes("USER") &&
          userNav.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded font-kanit"
            >
              {item.icon}
              {!isMini && item.text}
            </Link>
          ))}

        {user?.role.includes("APPROVER_1") && renderDropdown("เมนูหัวหน้าสาขา", approverNav1)}
        {user?.role.includes("VERIFIER") && renderDropdown("เมนูผู้ตรวจสอบ", verifierNav)}
        {user?.role.includes("RECEIVER") && renderDropdown("เมนูผู้รับหนังสือ", receiverNav)}
        {user?.role.includes("APPROVER_2") && renderDropdown("เมนูผู้อนุมัติ2", approverNav2)}
        {user?.role.includes("APPROVER_3") && renderDropdown("เมนูผู้อนุมัติ3", approverNav3)}
        {user?.role.includes("APPROVER_4") && renderDropdown("เมนูผู้อนุมัติ4", approverNav4)}

        {user?.role.includes("ADMIN") && renderDropdown("เมนูผู้ดูแล", adminNav)}
      </nav>
    </aside>
  );
}

export default Sidebar;
