import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import Login from '../layouts/Login'
import useAuth from '../hooks/useAuth'
import Header from '../components/Header'
import UserHome from '../layouts/UserHome'
import Leave from '../layouts/Leave'
import AddLeave from '../layouts/AddLeave'
import LeaveBalance from '../layouts/LeaveBalance'
import UserProfile from '../layouts/UserProfile'
import UserLanding from '../layouts/UserLanding'
import Approver from '../layouts/approver'
import DashBoard from '../layouts/DashBoard'
import FormGivingBirth from '../layouts/FormGivingBirth'
import FormPersonal from '../layouts/FormPersonal'
import FormSick from '../layouts/FormSick'
import FormVacation from '../layouts/FormVacation'
import AddLeave2 from '../layouts/AddLeave2'
import UserProfile2 from '../layouts/UserProfile2'
import Leave2 from '../layouts/Leave2'
import Admin from '../layouts/admin'



const guestRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      {/* <Header /> */}
      <Outlet />
    </>,
    children: [
      { index: true, element: <Login /> },
      //{ path: '/register', element: <Register />}
    ]
  }
])

const userRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      <Header />
      <Outlet />
    </>,
    children : [
      { index: true, element: <UserHome /> },
      { path: '/leave', element: <Leave2 />},
      { path: '/leave/add', element: <AddLeave2 />},
      { path: '/leave/balance', element: <LeaveBalance />},
      // { path: '/profile', element: <UserProfile />},
      { path: '/approve', element: <Approver />},
      { path: '/user/landing', element: <UserLanding />},
      { path: '/dashboard', element: <DashBoard />},
      { path: '/leave/vacation', element: <FormVacation />},
      { path: '/leave/giving-birth', element: <FormGivingBirth />},
      { path: '/leave/personal', element: <FormPersonal />},
      { path: '/leave/sick', element: <FormSick />},
      { path: '/leave/add2', element: <AddLeave2 />},
      { path: '/profile', element: <UserProfile2 />},
      { path: '/admin', element: <Admin />},
    ]
  }
])

export default function AppRouter() {
  const {user} = useAuth()
  const finalRouter = user?.id ? userRouter : guestRouter


  return (
    <RouterProvider router={finalRouter} />
  )
}
