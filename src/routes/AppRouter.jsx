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
