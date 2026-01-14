// components/SplashScreen.jsx

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-kanit text-2xl text-gray-700">
      <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 animate-pulse" />
      <p>กำลังโหลดระบบ...</p>
    </div>
  );
}
