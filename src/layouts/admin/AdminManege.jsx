import { useState } from "react";
import UserManageContent from "../../components/admin/manage/UserManageContent";
import PositionNumberManageContent from "../../components/admin/manage/PositionNumberManageContent";
import DepartmentManageContent from "../../components/admin/manage/OrganizationManageContent";
import HolidayManageContent from "../../components/admin/manage/HolidayManageContent";
export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", label: "จัดการผู้ใช้งาน", icon: "👤" },
    { id: "positions", label: "จัดการเลขที่ตำแหน่ง", icon: "💼" },
    { id: "departments", label: "จัดการแผนก", icon: "🏢" },
    { id: "holidays", label: "จัดการวันหยุด", icon: "📅" },
  ];

  // =========================
  // Components แต่ละหน้า
  // =========================

  const UserManagement = () => {
    return <UserManageContent />;
  };

  const PositionManagement = () => {
    return <PositionNumberManageContent />;
  };

  const DepartmentManagement = () => {
    return <DepartmentManageContent />;
  };

  const HolidayManagement = () => {
    return <HolidayManageContent />;
  };

  // =========================
  // Render Component ตาม Tab
  // =========================

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;

      case "positions":
        return <PositionManagement />;

      case "departments":
        return <DepartmentManagement />;

      case "holidays":
        return <HolidayManagement />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">
            ระบบจัดการข้อมูลหลัก
          </h1>

          <p className="text-gray-500 mt-2">จัดการข้อมูลทั้งหมดในหน้าเดียว</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-6">
          <div className="grid grid-cols-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-3
                  py-6 text-lg font-semibold transition-all
                  border-b-4

                  ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-blue-500"
                      : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-2xl">{tab.icon}</span>

                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
