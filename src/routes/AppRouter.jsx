import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

/** Auth layouts **/
import Login from "../layouts/auth/Login";
import Register from "../layouts/auth/Register";

/** Main components **/
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
 
/** User pages **/
import UserHome from "../layouts/user/UserHome";
import Leave2 from "../layouts/user/Leave2";
import AddLeave2 from "../layouts/user/AddLeave2";
import LeaveBalance from "../layouts/user/LeaveBalance";
import LeaveDetail from "../layouts/user/LeaveDetails";
import UserProfile2 from "../layouts/user/UserProfile2";
import UserLanding from "../layouts/user/UserLanding";
import UserDashBoard from "../layouts/user/UserDashBoard";

/** Approver pages **/
import LeaveApprover1 from "../layouts/approver/LeaveApprover1";
import LeaveApprover2 from "../layouts/approver/LeaveApprover2";
import LeaveApprover3 from "../layouts/approver/LeaveApprover3";
import LeaveApprover4 from "../layouts/approver/LeaveApprover4";
import LeaveReceiver from "../layouts/approver/LeaveReceiver";
import LeaveVerifier from "../layouts/approver/LeaveVerifier";

/** Admin pages **/
import DashBoard from "../layouts/admin/DashBoard";
import Approver from "../layouts/admin/Approver";
import DepartmentManage from "../layouts/admin/DepartmentManage";
import OrganizationManage from "../layouts/admin/OrganizationManage";
import PersonnelTypeManage from "../layouts/admin/PersonelTypeManage";
import HolidayManage from "../layouts/admin/HolidayManage";
import SettingManage from "../layouts/admin/SettingManage";
import LeaveTypeManage from "../layouts/admin/LeaveTypeManage";
import UserManage from "../layouts/admin/UserManage";
import EditUser from "../layouts/admin/EditUser";
import EditProfile from "../layouts/admin/EditProfile";
import AddnewUser from "../layouts/admin/AddnewUser";
import LeaveAdmin from "../layouts/admin/LeaveAdmin";

/** Layout หลัก */
function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);    // เปิดค้าง
  const [isMiniSidebar, setMiniSidebar] = useState(false);   // Full mode ก่อน

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleMiniSidebar = () => {
    setMiniSidebar(!isMiniSidebar);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMini={isMiniSidebar}
        toggleMiniSidebar={toggleMiniSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 bg-gray-100 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Routes สำหรับผู้ที่ยังไม่ล็อกอิน */
const guestRouter = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

/** Routes สำหรับผู้ที่ล็อกอินแล้ว */
const userRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true,            element: <UserHome /> },
      { path: "leave",          element: <Leave2 /> },
      { path: "leave/add",      element: <AddLeave2 /> },
      { path: "leave/balance",  element: <LeaveBalance /> },
      { path: "leave/:id",      element: <LeaveDetail /> },
      { path: "profile",        element: <UserProfile2 /> },
      { path: "profile/edit",   element: <EditProfile /> },
      { path: "user/landing",   element: <UserLanding /> },
      { path: "dashboard",      element: <UserDashBoard/>},

      // Approver group
      {
        path: "approver",
        children: [
          { path: "leave-request-approver1", element: <LeaveApprover1 /> },
          { path: "leave-request-approver2", element: <LeaveApprover2 /> },
          { path: "leave-request-approver3", element: <LeaveApprover3 /> },
          { path: "leave-request-approver4", element: <LeaveApprover4 /> },
          { path: "leave-request-receiver", element: <LeaveReceiver /> },
          { path: "leave-request-verifier", element: <LeaveVerifier /> },
        ],
      },

      // Admin group
      {
        path: "admin",
        children: [
          { path: "manage-user", element: <UserManage /> },
          { path: "leave-request", element: <LeaveAdmin /> },
          { path: "approve", element: <Approver /> },
          { path: "department-manage", element: <DepartmentManage /> },
          { path: "organization-manage", element: <OrganizationManage /> },
          { path: "personel-manage", element: <PersonnelTypeManage /> },
          { path: "holiday-manage", element: <HolidayManage /> },
          { path: "setting-manage", element: <SettingManage /> },
          { path: "leave-type-manage", element: <LeaveTypeManage /> },
          { path: "edit-profile", element: <EditProfile /> },
          { path: "add-user", element: <AddnewUser /> },
          { path: "user/:id", element: <EditUser /> },
          { path: "dashboard", element: <DashBoard /> },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

/** AppRouter หลัก */
export default function AppRouter() {
  const { user } = useAuth();
  const finalRouter = user?.id ? userRouter : guestRouter;
  return <RouterProvider router={finalRouter} />;
}
