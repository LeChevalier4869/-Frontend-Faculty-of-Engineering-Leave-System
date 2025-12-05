import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlineChevronDown } from "react-icons/hi";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaUser,
  FaCheckCircle,
  FaUsersCog,
  FaCog,
} from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.png";

const userNav = [
  { to: "/", text: "แดชบอร์ด", icon: <FaTachometerAlt /> },
  { to: "/leave/balance", text: "ยอดวันลาคงเหลือ", icon: <FaChartSimple /> },
  { to: "/leave", text: "การลา", icon: <FaClipboardList /> },
  { to: "/Calendar", text: "ปฏิทิน", icon: <FaCalendarAlt /> },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้", icon: <FaUser /> },
];

const approverNav1 = [
  { to: "/approver/dashboard-approver1", text: "แดชบอร์ดหัวหน้าสาขา", icon: <FaTachometerAlt /> },
  { to: "/approver/leave-request-approver1", text: "อนุมัติระดับหัวหน้าสาขา", icon: <FaCheckCircle /> },
];

const verifierNav = [{ to: "/approver/leave-request-verifier", text: "ตรวจสอบคำขอการลา", icon: <FaCheckCircle /> }];
const receiverNav = [{ to: "/approver/leave-request-receiver", text: "รับหนังสือคำขอลา", icon: <FaCheckCircle /> }];
const approverNav2 = [{ to: "/approver/leave-request-approver2", text: "อนุมัติระดับ 2", icon: <FaCheckCircle /> }];
const approverNav3 = [{ to: "/approver/leave-request-approver3", text: "อนุมัติระดับ 3", icon: <FaCheckCircle /> }];
const approverNav4 = [{ to: "/approver/leave-request-approver4", text: "อนุมัติระดับ 4", icon: <FaCheckCircle /> }];

const adminNav = [
  { to: "/admin/leave-report", text: "รายงานสรุปผล", icon: <FaUsersCog /> },
  { to: "/admin/leave-request", text: "คำขอการลา", icon: <FaUsersCog /> },
  { to: "/admin/add-other-request", text: "บันทึกคำขอการลาลงระบบ", icon: <FaUsersCog /> },
  { to: "/admin/manage-user", text: "จัดการผู้ใช้งาน", icon: <FaUsersCog /> },
  { to: "/admin/organization-manage", text: "จัดการองค์กร", icon: <FaUsersCog /> },
  { to: "/admin/department-manage", text: "จัดการแผนก", icon: <FaUsersCog /> },
  { to: "/admin/personel-manage", text: "จัดการประเภทบุคคล", icon: <FaUsersCog /> },
  { to: "/admin/holiday-manage", text: "จัดการวันหยุด", icon: <FaUsersCog /> },
  { to: "/admin/leave-type-manage", text: "จัดการประเภทการลา", icon: <FaUsersCog /> },
  { to: "/admin/config", text: "ตั้งค่า", icon: <FaCog /> },
];

export default function Sidebar({ isOpen, isMini, toggleMiniSidebar, onClose, isMobile }) {
  const { user } = useAuth();
  const location = useLocation();
  const [openAdmin, setOpenAdmin] = useState(false);

  if (!user) return null;

  const roles = Array.isArray(user.role)
    ? user.role
    : Array.isArray(user.roleNames)
    ? user.roleNames
    : [];

  const hasRole = (r) => roles.includes(r);
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  const Item = ({ to, icon, text }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl font-kanit text-sm transition ${
        isActive(to)
          ? "bg-white/20 text-white ring-1 ring-white/30"
          : "text-slate-200 hover:text-white hover:bg-white/10"
      }`}
    >
      <span className="text-base">{icon}</span>
      {!isMini && <span className="truncate">{text}</span>}
    </Link>
  );

  const Section = ({ title, children }) => (
    <div className="space-y-2">
      {!isMini && (
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-4 mt-2 mb-1">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );

  const showApproval =
    hasRole("APPROVER_1") ||
    hasRole("APPROVER_2") ||
    hasRole("APPROVER_3") ||
    hasRole("APPROVER_4") ||
    hasRole("VERIFIER") ||
    hasRole("RECEIVER");

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-full transform transition-transform duration-300 ease-in-out ${
          isMini ? "w-20" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/20 via-sky-600/10 to-blue-900/20" />
          <div className="absolute inset-0 backdrop-blur-md bg-slate-900/60 ring-1 ring-white/10" />

          <div className="relative h-full flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-10 h-10 rounded-md shadow-lg" />
                {!isMini && (
                  <div className="flex flex-col leading-tight">
                    <span className="font-kanit text-lg font-semibold tracking-wide">
                      eLeave System
                    </span>
                    <span className="text-xs text-slate-300">คณะวิศวกรรมศาสตร์</span>
                  </div>
                )}
              </div>
              <button
                onClick={toggleMiniSidebar}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMini ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {hasRole("USER") && (
                <Section title="ทั่วไป">
                  {userNav.map((m, i) => (
                    <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                  ))}
                </Section>
              )}

              {showApproval && (
                <Section title="งานอนุมัติ / สารบรรณ">
                  {hasRole("APPROVER_1") &&
                    approverNav1.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("VERIFIER") &&
                    verifierNav.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("RECEIVER") &&
                    receiverNav.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_2") &&
                    approverNav2.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_3") &&
                    approverNav3.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_4") &&
                    approverNav4.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                </Section>
              )}

              {hasRole("ADMIN") && (
                <Section title="ผู้ดูแลระบบ">
                  <button
                    onClick={() => setOpenAdmin((prev) => !prev)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/10 rounded-xl w-full"
                  >
                    <span className="flex items-center gap-3">
                      <FaUsersCog className="text-base" />
                      {!isMini && <span>เมนูผู้ดูแล</span>}
                    </span>
                    {!isMini && (
                      <HiOutlineChevronDown
                        className={`w-5 h-5 ml-2 transition-transform ${
                          openAdmin ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    )}
                  </button>
                  {openAdmin && (
                    <div className="flex flex-col mt-1 ml-4">
                      {adminNav.map((m, i) => (
                        <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                      ))}
                    </div>
                  )}
                </Section>
              )}
            </nav>

            {/* Footer */}
            <footer className="p-4 text-center text-xs text-slate-300 border-t border-white/10">
              © คณะวิศวกรรมศาสตร์
              <br />
              มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน
            </footer>
          </div>
        </div>
      </aside>

      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={onClose} />
      )}
    </>
  );
}
