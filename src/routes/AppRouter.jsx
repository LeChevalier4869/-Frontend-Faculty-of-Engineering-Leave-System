import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import useAuth from "../hooks/useAuth";
import Login2 from "../layouts/oauth/Login";
import Callback from "../layouts/oauth/Callback";

import Register from "../layouts/auth/Register";
import ForgotPassword from "../layouts/auth/ForgotPassword";
import ResetPassword from "../layouts/auth/ResetPassword";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Leave2 from "../layouts/user/Leave2";
import AddLeave2 from "../layouts/user/AddLeave2";
import LeaveBalance from "../layouts/user/LeaveBalance";
import LeaveDetail from "../layouts/user/LeaveDetails";
import UserProfile2 from "../layouts/user/UserProfile2";
import UserLanding from "../layouts/user/UserLanding";
import UserDashBoard from "../layouts/user/UserDashBoard";
import CalendarPage from "../layouts/user/CalendarPage";
import LeaveApprover1 from "../layouts/approver/LeaveApprover1";
import LeaveApprover2 from "../layouts/approver/LeaveApprover2";
import LeaveApprover3 from "../layouts/approver/LeaveApprover3";
import LeaveApprover4 from "../layouts/approver/LeaveApprover4";
import LeaveVerifier from "../layouts/approver/LeaveVerifier";
import Approver1Dashboard from "../layouts/approver/Approver1DashBoard";
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
import AddOtherRequest from "../layouts/admin/AddOtherRequest";
import ProxyApprovalManagement from "../layouts/admin/ProxyApprovalManagement";
import Config from "../layouts/admin/Config";
import ProtectedRoute from "../components/ProtectedRoute";
import bg from "../assets/bg.jpg";

function AppLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMiniSidebar, setMiniSidebar] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
      setMiniSidebar(false);
    };

    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleMiniSidebar = () => setMiniSidebar((v) => !v);

  const mainShift = clsx(
    "transition-all duration-300",
    isMobile ? "ml-0" : isMiniSidebar ? "ml-16" : "ml-64"
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1.5px]" />
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          isMini={isMiniSidebar}
          toggleMiniSidebar={toggleMiniSidebar}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            onMenuClick={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            isSidebarMini={isMiniSidebar}
            isMobile={isMobile}
          />
          <main className={clsx("flex-1 overflow-auto p-4", mainShift)}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

const guestRouter = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { path: "/", element: <Login2 /> },
      { path: "/login", element: <Login2 /> },
      { path: "/callback", element: <Callback /> },
      { path: "/dashboard", element: <UserDashBoard /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/add-other-request-dev", element: <AddOtherRequest /> },
      { path: "/leave-dev", element: <Leave2 /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

const userRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <UserDashBoard /> },
      { path: "dashboard", element: <UserDashBoard /> },
      { path: "leave", element: <Leave2 /> },
      { path: "leave/add", element: <AddLeave2 /> },
      { path: "leave/balance", element: <LeaveBalance /> },
      { path: "leave/:id", element: <LeaveDetail /> },
      { path: "profile", element: <UserProfile2 /> },
      { path: "profile/edit", element: <EditProfile /> },
      { path: "user/landing", element: <UserLanding /> },
      { path: "Calendar", element: <CalendarPage /> },
      {
        path: "approver",
        children: [
          { 
            path: "leave-request-approver1", 
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_1']} checkProxy={true}>
                <LeaveApprover1 />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-request-approver2", 
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_2']} checkProxy={true}>
                <LeaveApprover2 />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-request-approver3", 
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_3']} checkProxy={true}>
                <LeaveApprover3 />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-request-approver4", 
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_4']} checkProxy={true}>
                <LeaveApprover4 />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-request-verifier", 
            element: (
              <ProtectedRoute requiredRoles={['VERIFIER']} checkProxy={true}>
                <LeaveVerifier />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "dashboard-approver1", 
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_1']} checkProxy={true}>
                <Approver1Dashboard />
              </ProtectedRoute>
            ) 
          },
        ],
      },
      {
        path: "admin",
        children: [
          { 
            path: "dashboard", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <DashBoard />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-report", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <LeaveReport />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "manage-user", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <UserManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-request", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <LeaveAdmin />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "approve", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <Approver />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "department-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <DepartmentManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "organization-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <OrganizationManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "personel-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <PersonnelTypeManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "holiday-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <HolidayManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "setting-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <SettingManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "leave-type-manage", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <LeaveTypeManage />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "user-info/:id", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <UserInfo />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "add-user", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AddnewUser />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "edit-profile", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <EditProfile />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "user/:id", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <EditUser />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "add-other-request", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AddOtherRequest />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "proxy-approval", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <ProxyApprovalManagement />
              </ProtectedRoute>
            ) 
          },
          { 
            path: "config", 
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <Config />
              </ProtectedRoute>
            ) 
          },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function AppRouter() {
  const { user } = useAuth();
  
  // ตรวจสอบว่ามี token และ user หรือไม่
  const hasToken = localStorage.getItem("accessToken");
  const finalRouter = (user?.id && hasToken) ? userRouter : guestRouter;
  
  // Debug: ดูข้อมูล user และ routes
  console.log('🔍 Debug - AppRouter:', {
    user: user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: user.roles
    } : null,
    hasToken: !!hasToken,
    finalRouter: finalRouter === userRouter ? 'userRouter' : 'guestRouter'
  });
  
  return <RouterProvider router={finalRouter} />;
}