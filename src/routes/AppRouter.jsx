import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import Login from '../layouts/Login'
import useAuth from '../hooks/useAuth'
import Header from '../components/Header'
import UserHome from '../layouts/UserHome'
import Leave from '../layouts/Leave'
import AddLeave from '../layouts/AddLeave'
import LeaveBalance from '../layouts/LeaveBalance'
import UserProfile from '../layouts/UserProfile'




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
      { path: '/leave', element: <Leave />},
      { path: '/leave/add', element: <AddLeave />},
      { path: '/leave/balance', element: <LeaveBalance />},
      { path: '/profile', element: <UserProfile />},
    ]
  }
])

export default function AppRouter() {
  const {user} = useAuth()
  const finalRouter = user?.id ? userRouter : guestRouter
  console.log(user)
  return (
    <RouterProvider router={finalRouter} />
  )
}
