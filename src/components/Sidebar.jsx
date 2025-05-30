import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaUser,
  FaCheckCircle,
  FaUsersCog,
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const userNav = [
  { to: "/", text: "แดชบอร์ด", icon: <FaTachometerAlt /> },
  { to: "/leave/balance", text: "ยอดวันลาคงเหลือ", icon: <FaClipboardList /> },
  { to: "/leave", text: "การลา", icon: <FaCalendarAlt /> },
  { to: "/Calendar", text: "ปฏิทิน", icon: <FaCalendarAlt /> },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้", icon: <FaUser /> },
];

const approverNav1 = [
  { to: "/approver/dashboard-approver1", text: "แดชบอร์ดหัวหน้าสาขา", icon: <FaTachometerAlt /> },
  { to: "/approver/leave-request-approver1", text: "อนุมัติระดับหัวหน้าสาขา", icon: <FaCheckCircle /> },
  
];
const verifierNav = [
  { to: "/approver/leave-request-verifier", text: "ตรวจสอบคำขอการลา", icon: <FaCheckCircle /> },
];
const receiverNav = [
  { to: "/approver/leave-request-receiver", text: "รับหนังสือคำขอลา", icon: <FaCheckCircle /> },
];
const approverNav2 = [
  { to: "/approver/leave-request-approver2", text: "อนุมัติระดับ 2", icon: <FaCheckCircle /> },
];
const approverNav3 = [
  { to: "/approver/leave-request-approver3", text: "อนุมัติระดับ 3", icon: <FaCheckCircle /> },
];
const approverNav4 = [
  { to: "/approver/leave-request-approver4", text: "อนุมัติระดับ 4", icon: <FaCheckCircle /> },
];

const adminNav = [
  { to: "/admin/leave-report", text: "รายงานสรุปผล", icon: <FaUsersCog /> },
  { to: "/admin/manage-user", text: "จัดการผู้ใช้งาน", icon: <FaUsersCog /> },
  { to: "/admin/organization-manage", text: "จัดการองค์กร", icon: <FaUsersCog /> },
  { to: "/admin/department-manage", text: "จัดการแผนก", icon: <FaUsersCog /> },
  { to: "/admin/personel-manage", text: "จัดการประเภทบุคคล", icon: <FaUsersCog /> },
  { to: "/admin/holiday-manage", text: "จัดการวันหยุด", icon: <FaUsersCog /> },
  { to: "/admin/leave-type-manage", text: "จัดการประเภทการลา", icon: <FaUsersCog /> },
];

export default function Sidebar({ isOpen, isMini, toggleMiniSidebar, onClose, isMobile }) {
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  if (!user) return null;

  const roles = Array.isArray(user.role)
    ? user.role
    : Array.isArray(user.roleNames)
    ? user.roleNames
    : [];

  const hasRole = (r) => roles.includes(r);
  const toggleDropdown = (title) =>
    setOpenDropdown(openDropdown === title ? null : title);

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
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-gray-900 text-white font-kanit transform transition-transform duration-300 ease-in-out
        ${isMini ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isMini && (
            <span className="text-2xl font-bold truncate">เมนูหลัก</span>
          )}
          <button
            onClick={toggleMiniSidebar}
            className="p-1 rounded hover:bg-gray-700 transition"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMini ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-2 p-4">
          {hasRole("USER") &&
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

          {hasRole("APPROVER_1") && renderDropdown("เมนูหัวหน้าสาขา", approverNav1)}
          {hasRole("VERIFIER") && renderDropdown("เมนูผู้ตรวจสอบ", verifierNav)}
          {hasRole("RECEIVER") && renderDropdown("เมนูผู้รับหนังสือ", receiverNav)}
          {hasRole("APPROVER_2") && renderDropdown("เมนูผู้อนุมัติ2", approverNav2)}
          {hasRole("APPROVER_3") && renderDropdown("เมนูผู้อนุมัติ3", approverNav3)}
          {hasRole("APPROVER_4") && renderDropdown("เมนูผู้อนุมัติ4", approverNav4)}
          {hasRole("ADMIN") && renderDropdown("เมนูผู้ดูแล", adminNav)}
        </nav>
      </aside>

      {/* ✅ Overlay บนมือถือ: ปิดเมื่อกดพื้นหลัง */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}
