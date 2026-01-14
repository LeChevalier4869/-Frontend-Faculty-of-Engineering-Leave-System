// Topbar.jsx
import PropTypes from "prop-types";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 shadow bg-white font-kanit">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-700"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="text-sm md:text-base font-medium">
        สวัสดี, ณัฐวัฒน์
      </div>
    </header>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
