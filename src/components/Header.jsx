import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const guestNav = [
  { to: "/", text: "Login" },
  { to: "/register", text: "Register" },
];

const userNav = [
  { to: "/", text: "หน้าหลัก" },
  { to: "/dashboard", text: "แดชบอร์ด" },
  { to: "/leave", text: "การลา" },
  // { to: "/leave/balance", text: "ดูสิทธิ์การลา" },
];

const adminNav = [
  { to: "/admin", text: "ADMIN" },
  { to: "/", text: "หน้าหลัก" },
  { to: "/approve", text: "การลาที่รอการอนุมัติ" },
  { to: "/user/landing", text: "บุคลากร" },
  { to: "/dashboard", text: "แดชบอร์ด" },
  { to: "/leave", text: "การลา" },
  // { to: "/leave/balance", text: "ดูสิทธิ์การลา" },
];

const aproverNav = [
  { to: "/", text: "หน้าหลัก" },
  { to: "/approve", text: "การลาที่รอการอนุมัติ" },
  { to: "/user/landing", text: "บุคลากร" },
  { to: "/dashboard", text: "แดชบอร์ด" },
  { to: "/leave", text: "การลา" },
  // { to: "/leave/balance", text: "ดูสิทธิ์การลา" },
];
function Header() {
  const { user, logout } = useAuth();

  let finalNav = [];
  if (!user?.id) {
    finalNav = guestNav;
  }
  if (user?.id && user?.role === "ADMIN") {
    finalNav = adminNav;
  }
  if (user?.id && user?.role === "USER") {
    finalNav = userNav;
  }
  if (user?.id && user?.role === "APPROVER") {
    finalNav = aproverNav;
  }

  const navigate = useNavigate();

  const hdlLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-[#8B0000] via-[#A52A2A] to-[#FF4500] text-white shadow-md">
      <div className="container mx-auto px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg font-semibold tracking-wide">
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity duration-200"
          >
            ระบบวันลาคณะวิศวกรรมศาสตร์
          </Link>
        </div>

        {/* Navigation Menu - Centered */}
        <ul className="flex-1 flex justify-center space-x-4 text-sm font-bold">
          {finalNav.map((el) => (
            <li key={el.to} className="relative group">
              <Link
                to={el.to}
                className="px-4 py-2 block rounded-md text-white hover:text-gray-300 transition-all duration-300"
              >
                {el.text}
              </Link>
              {/* Underline Animation */}
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-300 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div>
          {user?.id && (
            <button
              onClick={hdlLogout}
              className="px-4 py-2 bg-white text-[#8B0000] text-sm font-medium rounded shadow hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
            >
              ออกจากระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
