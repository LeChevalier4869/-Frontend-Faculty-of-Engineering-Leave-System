// components/SplashScreen.jsx — หน้าโหลดระบบ (แบรนด์คณะวิศวกรรมศาสตร์ เลือดหมู)
import PropTypes from "prop-types";
import logo from "../assets/logo.png";

export default function SplashScreen({ fadeOut = false }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 font-kanit text-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* แถบทองด้านบน */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gold" />

      {/* โลโก้ในวงแหวนเรืองแสง */}
      <div className="relative mb-7">
        <span className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm">
          <img src={logo} alt="Logo" className="h-16 w-16 object-contain drop-shadow-lg" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-center">
        ระบบจัดการวันลา
      </h1>
      <p className="mt-1.5 text-sm md:text-base text-white/70 text-center">
        คณะวิศวกรรมศาสตร์ · มทร.อีสาน วิทยาเขตขอนแก่น
      </p>

      {/* แถบโหลดแบบ indeterminate */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/2 rounded-full bg-gold animate-splash-bar" />
      </div>
      <p className="mt-3 text-xs text-white/50">กำลังโหลดระบบ...</p>
    </div>
  );
}

SplashScreen.propTypes = {
  fadeOut: PropTypes.bool,
};
