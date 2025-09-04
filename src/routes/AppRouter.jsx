import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import clsx from "clsx"; // ✅ ใช้ควบคุม class แบบ dynamic
import useAuth from "../hooks/useAuth";

/** OAuth layouts **/
import Login2 from "../layouts/oauth/Login";
import Profile2 from "../layouts/oauth/Profile";
import Callback from "../layouts/oauth/Callback";

/** Auth layouts **/
import Login from "../layouts/auth/Login";
import Register from "../layouts/auth/Register";
import ForgotPassword from "../layouts/auth/ForgotPassword";
import ResetPassword from "../layouts/auth/ResetPassword";

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
import ChangePassword from "../layouts/user/ChangePassword";
import CalendarPage from "../layouts/user/CalendarPage";

/** Approver pages **/
import LeaveApprover1 from "../layouts/approver/LeaveApprover1";
import LeaveApprover2 from "../layouts/approver/LeaveApprover2";
import LeaveApprover3 from "../layouts/approver/LeaveApprover3";
import LeaveApprover4 from "../layouts/approver/LeaveApprover4";
import LeaveReceiver from "../layouts/approver/LeaveReceiver";
import LeaveVerifier from "../layouts/approver/LeaveVerifier";
import Approver1Dashboard from "../layouts/approver/Approver1DashBoard";

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
import UserInfo from "../layouts/admin/UserInfo";
import EditUser from "../layouts/admin/EditUser";
import EditProfile from "../layouts/admin/EditProfile";
import AddnewUser from "../layouts/admin/AddnewUser";
import LeaveAdmin from "../layouts/admin/LeaveAdmin";
import LeaveReport from "../layouts/admin/LeaveReport";

/** Layout หลักพร้อม Sidebar */
function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMiniSidebar, setMiniSidebar] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleMiniSidebar = () => {
    setMiniSidebar(!isMiniSidebar);
  };

  const mainShift = clsx(
    "transition-all duration-300",
    isMiniSidebar ? "ml-16" : "ml-64"
  );

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
        <main
          className={clsx("flex-1 overflow-auto p-4 bg-gray-100", mainShift)}
        >
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
      { path: "/", element: <Login2 /> },
      { path: "/login", element: <Login2 /> },
      { path: "callback", element: <Callback /> },
      // { path: "/oauth/callback", element: <OAuthCallback /> },
      { path: "/dashboard", element: <DashBoard /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

/** Routes สำหรับผู้ที่ล็อกอินแล้ว */
const userRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <UserDashBoard /> },
      // { path: "callback", element: <Callback /> },
      { path: "dashboard", element: <UserDashBoard /> },
      { path: "leave", element: <Leave2 /> },
      { path: "leave/add", element: <AddLeave2 /> },
      { path: "leave/balance", element: <LeaveBalance /> },
      { path: "leave/:id", element: <LeaveDetail /> },
      { path: "profile", element: <Profile2 /> },
      // { path: "profile", element: <UserProfile2 /> },
      { path: "profile/edit", element: <EditProfile /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "user/landing", element: <UserLanding /> },
      { path: "Calendar", element: <CalendarPage /> },

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
          { path: "dashboard-approver1", element: <Approver1Dashboard /> },
        ],
      },

      // Admin group
      {
        path: "admin",
        children: [
          { path: "dashboard", element: <DashBoard /> },
          { path: "leave-report", element: <LeaveReport /> },
          { path: "manage-user", element: <UserManage /> },
          { path: "leave-request", element: <LeaveAdmin /> },
          { path: "approve", element: <Approver /> },
          { path: "department-manage", element: <DepartmentManage /> },
          { path: "organization-manage", element: <OrganizationManage /> },
          { path: "personel-manage", element: <PersonnelTypeManage /> },
          { path: "holiday-manage", element: <HolidayManage /> },
          { path: "setting-manage", element: <SettingManage /> },
          { path: "leave-type-manage", element: <LeaveTypeManage /> },
          { path: "user-info/:id", element: <UserInfo /> },
          { path: "add-user", element: <AddnewUser /> },
          { path: "edit-profile", element: <EditProfile /> },
          { path: "user/:id", element: <EditUser /> },
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
