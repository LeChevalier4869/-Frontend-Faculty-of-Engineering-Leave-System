import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const guestNav = [
  { to: "/", text: "Login" },
  { to: "/register", text: "Register" },
];

const userNav = [
  { to: "/", text: "หน้าหลัก" },
  { to: "/leave", text: "การลา" },
  { to: "/leave/balance", text: "ดูสิทธิ์การลา" },
];

const adminNav = [
  { to: "/admin", text: "ADMIN" },
  { to: "/", text: "หน้าหลัก" },
  { to: "/1", text: "ยื่นลา" },
  { to: "/2", text: "ดูสิทธิ์การลา" },
  { to: "/3", text: "ประวัติการลา" },
];

function Header() {
  const { user, logout } = useAuth();

  let finalNav = null;
  if (!user?.id) {
    finalNav = guestNav;
  }
  if (user?.id && user?.role === "ADMIN") {
    finalNav = adminNav;
  }
  if (user?.id && user?.role === "USER") {
    finalNav = userNav;
  }

  const navigate = useNavigate();

  const hdlLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-[#8B0000] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg font-semibold">
          <Link to="/">ระบบวันลาคณะวิศวกรรมศาสตร์</Link>
        </div>

        {/* Navigation Menu - Centered */}
        <ul className="flex-1 flex justify-center space-x-8 text-sm">
          {finalNav.map((el) => (
            <li key={el.to}>
              <Link to={el.to} className="hover:text-gray-300">
                {el.text}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div>
          {user?.id && (
            <button
              onClick={hdlLogout}
              className="hover:text-gray-300 focus:outline-none"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
