import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import clsx from "clsx";
import useAuth from "../hooks/useAuth";

// คอมโพเนนต์โครงหลัก (โหลดทันที ไม่ lazy เพื่อให้ layout/route guard พร้อมใช้)
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import bg from "../assets/bg.jpg";

/*
 * ทุกหน้าโหลดแบบ lazy (code-splitting) แล้วครอบด้วย <Suspense> ที่มี fallback กลางตัวเดียว
 * → ตอน navigate ไปหน้าใดๆ จะเห็น loading UI แบบเดียวกันเสมอ และ bundle ถูกแบ่งเป็นก้อนย่อย
 */
const Login2 = lazy(() => import("../layouts/oauth/Login"));
const Callback = lazy(() => import("../layouts/oauth/Callback"));
const Leave2 = lazy(() => import("../layouts/user/Leave2"));
const AddLeave2 = lazy(() => import("../layouts/user/AddLeave2"));
const LeaveBalance = lazy(() => import("../layouts/user/LeaveBalance"));
const LeaveDetail = lazy(() => import("../layouts/user/LeaveDetails"));
const UserProfile2 = lazy(() => import("../layouts/user/UserProfile2"));
const UserLanding = lazy(() => import("../layouts/user/UserLanding"));
const UserDashBoard = lazy(() => import("../layouts/user/UserDashBoard"));
const CalendarPage = lazy(() => import("../layouts/user/CalendarPage"));
const LeaveApprover1 = lazy(() => import("../layouts/approver/LeaveApprover1"));
const LeaveApprover2 = lazy(() => import("../layouts/approver/LeaveApprover2"));
const LeaveApprover3 = lazy(() => import("../layouts/approver/LeaveApprover3"));
const LeaveApprover4 = lazy(() => import("../layouts/approver/LeaveApprover4"));
const LeaveVerifier = lazy(() => import("../layouts/approver/LeaveVerifier"));
const ApproverDashboard = lazy(() => import("../layouts/approver/ApproverDashboard"));


/** Admin pages **/
import AdminDashboard from "../layouts/admin/AdminDashBoard";
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
import LeaveReport from "../layouts/admin/LeaveReport";
import AuditLogManagement from "../layouts/admin/AuditLogManagement";
import Config from "../layouts/admin/Config";
import PositionNumberManagement from "../layouts/admin/PositionNumberManagement";
import RoleManagement from "../layouts/admin/RoleManagement";
import RankManage from "../layouts/admin/RankManage";
import AdminManagementPage from "../layouts/admin/AdminManege";
import ReportPage from "../layouts/admin/Report";

function AppLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  const mainShift = clsx(
    "transition-all duration-300",
    isMobile ? "ml-0" : "ml-64"
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
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            onMenuClick={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />
          <main className={clsx("flex-1 overflow-auto p-4", mainShift)}>
            {/* fallback กลาง: ทุกหน้าที่ navigate เข้ามาจะเห็น loading แบบเดียวกัน */}
            <Suspense fallback={<LoadingSpinner message="กำลังโหลดหน้า..." fullScreen={false} />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

const guestRouter = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<LoadingSpinner message="กำลังโหลด..." />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      { path: "/", element: <Login2 /> },
      { path: "/login", element: <Login2 /> },
      { path: "/callback", element: <Callback /> },
      { path: "/dashboard", element: <UserDashBoard /> },
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
            path: "dashboard-approver",
            element: (
              <ProtectedRoute requiredRoles={['APPROVER_1','APPROVER_2','APPROVER_3','APPROVER_4',]} checkProxy={true}>
                <ApproverDashboard />
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
                <AdminDashboard />
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
            path: "position-numbers",
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <PositionNumberManagement />
              </ProtectedRoute>
            )
          },
          {
            path: "organization",
            element: (
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <OrganizationManage />
              </ProtectedRoute>
            )
          },
          {
            path: "organization-manage",
            element: (
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <OrganizationManage />
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
            path: "personel-manage",
            element: (
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <PersonnelTypeManage />
              </ProtectedRoute>
            )
          },
          {
            path: "rank-manage",
            element: (
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <RankManage />
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
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
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
          // ย้ายไปเป็นแท็บในหน้า "การจัดการ" แล้ว — คง path เดิมไว้เป็น redirect กัน bookmark เสีย
          {
            path: "add-other-request",
            element: (
              <Navigate
                to="/admin/management"
                replace
                state={{ activeTab: "leaveRequests" }}
              />
            )
          },
          {
            path: "proxy-approval",
            element: (
              <Navigate
                to="/admin/management"
                replace
                state={{ activeTab: "proxy" }}
              />
            )
          },
          {
            path: "audit-logs",
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AuditLogManagement />
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
          {
            path: "role-management",
            element: (
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <RoleManagement />
              </ProtectedRoute>
            )
          },
          {
            path: "management",
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminManagementPage />
              </ProtectedRoute>
            )
          },
          {
            path: "report",
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <ReportPage />
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

  return <RouterProvider router={finalRouter} />;
}
