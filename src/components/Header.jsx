import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, LogOut, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

function Header({ onMenuClick, isMobile = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fullName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    [user?.firstName, user?.lastName]
  );
  const initials =
    (user?.firstName?.[0] ?? "U").toUpperCase() +
    (user?.lastName?.[0] ?? "").toUpperCase();

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex items-center justify-center rounded-2xl w-10 h-10 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-slate-100" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
        {/* ปุ่มแจ้งเตือนแบบ glass */}
        <button
          className="hidden sm:inline-flex items-center justify-center rounded-2xl w-10 h-10 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-100" />
        </button>

        {user?.id && (
          <div className="relative" ref={dropdownRef}>
            {/* ปุ่มโปรไฟล์แบบกลมกลืนธีม */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="group flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 lg:px-3 lg:py-2 shadow-sm hover:shadow-lg transition text-slate-50"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold shadow-md">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-none truncate max-w-[10rem]">
                    {fullName || "ไม่มีชื่อ"}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-tight truncate max-w-[10rem]">
                    {user?.email}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-200 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown โปรไฟล์ */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden backdrop-blur-md">
                {/* ส่วนบน: ข้อมูล user */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold shadow-md">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-50 truncate">
                        {fullName || "ไม่มีชื่อ"}
                      </div>
                      <div className="text-xs text-slate-300 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="rounded-lg bg-slate-800/80 px-2 py-1 border border-white/5">
                      คณะ:{" "}
                      <span className="font-medium text-slate-100">
                        {user?.department?.organization?.name ?? "-"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-800/80 px-2 py-1 border border-white/5">
                      สาขา:{" "}
                      <span className="font-medium text-slate-100">
                        {user?.department?.name ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ปุ่ม logout */}
                <div className="p-1 bg-slate-900">
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <LogOut className="w-5 h-5" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default Header;
