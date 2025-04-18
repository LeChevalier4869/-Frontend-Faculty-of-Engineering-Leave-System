import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/** Auth layouts **/
import Login from '../layouts/auth/Login';
import Register from '../layouts/auth/Register';

/** Main wrappers **/
import Header from '../components/Header';
import Menu   from '../components/Menu';

/** User pages **/
import UserHome     from '../layouts/user/UserHome';
import Leave2       from '../layouts/user/Leave2';
import AddLeave2    from '../layouts/user/AddLeave2';
import LeaveBalance from '../layouts/user/LeaveBalance';
import LeaveDetail  from '../layouts/user/LeaveDetails';
import UserProfile2 from '../layouts/user/UserProfile2';
import UserLanding  from '../layouts/user/UserLanding';

/** Admin pages **/
import AdminLayout     from '../layouts/admin/Admin';
import DashBoard       from '../layouts/admin/DashBoard';
import Approver        from '../layouts/admin/Approver';
import DepartmentManage from '../layouts/admin/DepartmentManage';
import UserManage      from '../layouts/admin/UserManage';
import EditUser        from '../layouts/admin/EditUser';
import EditProfile     from '../layouts/admin/EditProfile';
import AddnewUser      from '../layouts/admin/AddnewUser';


// Routes สำหรับผู้ที่ยังไม่ล็อกอิน
const guestRouter = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { path: '/',        element: <Login /> },
      { path: '/register',element: <Register /> },
      { path: '*',        element: <Navigate to="/" replace /> },
    ]
  }
]);

// Routes สำหรับผู้ที่ล็อกอินแล้ว
const userRouter = createBrowserRouter([
  {
    element: (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1">
          <div className="w-64 bg-gray-200"><Menu /></div>
          <div className="flex-1 overflow-auto"><Outlet /></div>
        </div>
      </div>
    ),
    children: [
      // หน้า user ปกติ
      { index: true,        element: <UserHome /> },
      { path: 'leave',      element: <Leave2 /> },
      { path: 'leave/add',  element: <AddLeave2 /> },
      { path: 'leave/balance', element: <LeaveBalance /> },
      { path: 'leave/:id',  element: <LeaveDetail /> },
      { path: 'profile',    element: <UserProfile2 /> },
      { path: 'profile/edit', element: <EditProfile /> },
      { path: 'user/landing', element: <UserLanding /> },

      // กลุ่ม admin (nested)
      {
        path: 'admin',
        children: [
          { path: 'manage-user', element: <UserManage /> },
          { path: 'approve',               element: <Approver /> },
          { path: 'department-manage',     element: <DepartmentManage /> },
          { path: 'manage-user',           element: <UserManage /> },
          { path: 'edit-profile',          element: <EditProfile /> },
          { path: 'add-user',              element: <AddnewUser/> },
          { path: 'user/:id',              element: <EditUser/> },     
        ]
      },
      // fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ]
  }
]);

export default function AppRouter() {
  const { user } = useAuth();
  const finalRouter = user?.id ? userRouter : guestRouter;
  return <RouterProvider router={finalRouter} />;
}
