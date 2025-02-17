import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Login from '../layouts/Login';
import useAuth from '../hooks/useAuth';
import Header from '../components/Header';
import Menu from '../components/Menu';
import UserHome from '../layouts/UserHome';
import Leave2 from '../layouts/Leave2';
import AddLeave2 from '../layouts/AddLeave2';
import LeaveBalance from '../layouts/LeaveBalance';
import Approver from '../layouts/approver';
import DashBoard from '../layouts/DashBoard';
import UserProfile2 from '../layouts/UserProfile2';
import Admin from '../layouts/admin';
import UserLanding from '../layouts/UserLanding';
import Register from '../layouts/register';
import LeaveDetail from '../layouts/LeaveDetails';


const guestRouter = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      { index: true, element: <Login /> },
      { path: '/register', element: <Register /> },
      
    ]
  }
]);

const userRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <Header />

          <div className="flex flex-1">
            {/* Menu */}
            <div className="w-64 bg-gray-200">
              <Menu />
            </div>
            {/* Outlet for content */}
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </>
    ),
    children: [
      { index: true, element: <UserHome /> },
      { path: '/leave', element: <Leave2 /> },
      { path: '/leave/add', element: <AddLeave2 /> },
      { path: '/leave/balance', element: <LeaveBalance /> },
      { path: '/approve', element: <Approver /> },
      { path: '/dashboard', element: <DashBoard /> },
      { path: '/profile', element: <UserProfile2 /> },
      { path: '/admin', element: <Admin /> },
      { path: '/user/landing', element: <UserLanding /> },
      { path: '/leave/:id', element: <LeaveDetail /> },
    ]
  }
]);

export default function AppRouter() {
  const { user } = useAuth();
  const finalRouter = user?.id ? userRouter : guestRouter;

  return <RouterProvider router={finalRouter} />;
}
