import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaUsersCog,
  FaIdBadge,
  FaBuilding,
  FaCalendarAlt,
  FaFileSignature,
  FaUserShield,
  FaUserCheck,
} from "react-icons/fa";

import UserManageContent from "../../components/admin/manage/UserManageContent";
import PositionNumberManageContent from "../../components/admin/manage/PositionNumberManageContent";
import DepartmentManageContent from "../../components/admin/manage/OrganizationManageContent";
import HolidayManageContent from "../../components/admin/manage/HolidayManageContent";
import ApproverManageContent from "../../components/admin/manage/ApproverManageContent";
import AddOtherRequest from "./AddOtherRequest";
import ProxyApprovalManagement from "./ProxyApprovalManagement";
export default function ManagementPage() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "users",
  );

  const tabs = [
    { id: "users", label: "จัดการผู้ใช้งาน", icon: <FaUsersCog /> },
    { id: "positions", label: "จัดการเลขที่ตำแหน่ง", icon: <FaIdBadge /> },
    { id: "departments", label: "จัดการแผนก", icon: <FaBuilding /> },
    { id: "approvers", label: "จัดการผู้อนุมัติ", icon: <FaUserCheck /> },
    { id: "holidays", label: "จัดการวันหยุด", icon: <FaCalendarAlt /> },
    { id: "leaveRequests", label: "บันทึกคำขอการลา", icon: <FaFileSignature /> },
    { id: "proxy", label: "จัดการการมอบอำนาจ", icon: <FaUserShield /> },
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

      case "approvers":
        return <ApproverManageContent />;

      case "holidays":
        return <HolidayManagement />;

      case "leaveRequests":
        return <AddOtherRequest />;

      case "proxy":
        return <ProxyApprovalManagement />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>

          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                ระบบจัดการข้อมูลหลัก
              </h1>

              <p className="text-sm text-slate-600">
                จัดการข้อมูลทั้งหมดในหน้าเดียว
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center gap-1.5
                  px-2 py-4 text-xs sm:text-sm font-semibold transition-all
                  border-b-4 text-center leading-tight

                  ${
                    activeTab === tab.id
                      ? "bg-brand-50 text-brand-700 border-brand-600"
                      : "bg-white text-slate-600 border-transparent hover:bg-slate-50"
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>

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
